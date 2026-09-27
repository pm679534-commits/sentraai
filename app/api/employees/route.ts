export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { planFeatures } from "@/lib/plans";
import {
  ApiError,
  jsonError,
  mutationGuard,
  parseBody,
  requireManager,
  requireUser,
} from "@/lib/api";
const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z
    .string()
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  department: z.string().trim().min(2).max(80),
});
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const q = request.nextUrl.searchParams.get("q")?.slice(0, 80);
    const data = await prisma.employee.findMany({
      where: {
        organizationId: user.organizationId!,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { department: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: planFeatures[user.plan].departmentRiskAnalytics
        ? { riskScore: "desc" } : { name: "asc" },
      take: 200,
    });
    return NextResponse.json({
      data: planFeatures[user.plan].departmentRiskAnalytics
        ? data : data.map(({ riskScore: _riskScore, ...employee }) => employee),
    });
  } catch (error) {
    return jsonError(error);
  }
}
export async function POST(request: NextRequest) {
  try {
    mutationGuard(request);
    const user = await requireManager();
    const data = await parseBody(request, schema);
    const employee = await prisma.employee.create({
      data: { ...data, organizationId: user.organizationId! },
    });
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId!,
        actorId: user.id,
        action: "employee.created",
        targetType: "Employee",
        targetId: employee.id,
      },
    });
    const visible = planFeatures[user.plan].departmentRiskAnalytics
      ? employee : (({ riskScore: _riskScore, ...record }) => record)(employee);
    return NextResponse.json({ data: visible }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
