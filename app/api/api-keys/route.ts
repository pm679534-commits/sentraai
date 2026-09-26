export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, mutationGuard, parseBody, requireManager } from "@/lib/api";
import { makeApiKey } from "@/lib/security";
export async function GET() {
  try {
    const user = await requireManager();
    return NextResponse.json({
      data: await prisma.apiKey.findMany({
        where: { organizationId: user.organizationId! },
        select: {
          id: true,
          name: true,
          prefix: true,
          createdAt: true,
          lastUsedAt: true,
          revokedAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    });
  } catch (error) {
    return jsonError(error);
  }
}
export async function POST(request: NextRequest) {
  try {
    mutationGuard(request);
    const user = await requireManager();
    const { name } = await parseBody(
      request,
      z.object({ name: z.string().trim().min(2).max(80) }),
    );
    const key = makeApiKey();
    const row = await prisma.apiKey.create({
      data: {
        organizationId: user.organizationId!,
        name,
        prefix: key.prefix,
        hash: key.hash,
      },
      select: { id: true, name: true, prefix: true, createdAt: true },
    });
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId!,
        actorId: user.id,
        action: "api_key.created",
        targetType: "ApiKey",
        targetId: row.id,
      },
    });
    return NextResponse.json(
      { data: { ...row, key: key.raw } },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return jsonError(error);
  }
}
