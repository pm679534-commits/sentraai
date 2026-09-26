export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ApiError, jsonError, parseBody } from "@/lib/api";
import { clientIp, rateLimit, sha256 } from "@/lib/security";
import { scanText, type Category } from "@/lib/detection-engine";

/** Future extension contract: POST JSON {text, tool, employeeEmail?} with Authorization: Bearer <org API key>. */
const schema = z.object({
  text: z.string().min(1).max(20_000),
  tool: z.string().trim().min(2).max(60),
  employeeEmail: z.string().email().max(254).optional(),
});
export async function POST(request: NextRequest) {
  try {
    if (!(await rateLimit(`scan-ip:${clientIp(request)}`, 300, 60)))
      throw new ApiError(429, "RATE_LIMITED", "Scan rate limit exceeded");
    const auth = request.headers.get("authorization") ?? "";
    if (!auth.startsWith("Bearer sentra_live_"))
      throw new ApiError(401, "INVALID_API_KEY", "A valid API key is required");
    const key = await prisma.apiKey.findUnique({
      where: { hash: sha256(auth.slice(7)) },
      include: { organization: { select: { status: true } } },
    });
    if (!key || key.revokedAt || key.organization.status === "SUSPENDED")
      throw new ApiError(401, "INVALID_API_KEY", "A valid API key is required");
    if (!(await rateLimit(`scan:${key.id}`, 120, 60)))
      throw new ApiError(429, "RATE_LIMITED", "Scan rate limit exceeded");
    const data = await parseBody(request, schema);
    const [result, policies] = await Promise.all([
      scanText(data.text),
      prisma.policyRule.findMany({
        where: { organizationId: key.organizationId, enabled: true },
      }),
    ]);
    const active = new Map(policies.map((p) => [p.category, p.action]));
    const matches = result.matches.filter((m) => active.has(m.category));
    let maskedText = "",
      cursor = 0;
    for (const match of matches) {
      maskedText +=
        data.text.slice(cursor, match.start) +
        (active.get(match.category) === "ALERT"
          ? data.text.slice(match.start, match.end)
          : `[${match.category} REDACTED]`);
      cursor = match.end;
    }
    maskedText += data.text.slice(cursor);
    const counts = new Map<Category, number>();
    for (const match of matches)
      counts.set(match.category, (counts.get(match.category) ?? 0) + 1);
    const employee = data.employeeEmail
      ? await prisma.employee.findFirst({
          where: {
            organizationId: key.organizationId,
            email: data.employeeEmail.toLowerCase(),
          },
          select: { id: true, riskScore: true },
        })
      : null;
    await prisma.$transaction(async (tx) => {
      await tx.scanEvent.create({
        data: {
          organizationId: key.organizationId,
          tool: data.tool,
          findingCount: matches.length,
          blocked: matches.some((m) => active.get(m.category) === "BLOCK"),
          masked: matches.some((m) => active.get(m.category) === "MASK"),
        },
      });
      for (const [category, matchCount] of counts)
        await tx.incident.create({
          data: {
            organizationId: key.organizationId,
            employeeId: employee?.id,
            tool: data.tool,
            category,
            matchCount,
            action: active.get(category)!,
            severity:
              category === "SECRET" || category === "CARD" ? "HIGH" : "MEDIUM",
            source: "gateway",
          },
        });
      if (employee)
        await tx.employee.update({
          where: { id: employee.id },
          data: {
            requestCount: { increment: 1 },
            riskScore: Math.min(
              100,
              employee.riskScore + (counts.size ? 2 : 0),
            ),
          },
        });
      await tx.apiKey.update({
        where: { id: key.id },
        data: { lastUsedAt: new Date() },
      });
    });
    return NextResponse.json(
      {
        clean: matches.length === 0,
        matches: matches.map((m) => ({ ...m, action: active.get(m.category) })),
        maskedText,
        blocked: matches.some((m) => active.get(m.category) === "BLOCK"),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return jsonError(error);
  }
}
