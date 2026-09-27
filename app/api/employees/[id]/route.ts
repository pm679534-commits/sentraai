export const dynamic = "force-dynamic";
import { ids } from "@/lib/api";
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
  name: z.string().trim().min(2).max(100).optional(),
  department: z.string().trim().min(2).max(80).optional(),
});
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    ids.parse(params.id);
    const user = await requireUser();
    const data = await prisma.employee.findFirst({
      where: { id: params.id, organizationId: user.organizationId! },
    });
    if (!data) throw new ApiError(404, "NOT_FOUND", "Employee not found");
    return NextResponse.json({
      data: planFeatures[user.plan].departmentRiskAnalytics
        ? data : (({ riskScore: _riskScore, ...record }) => record)(data),
    });
  } catch (error) {
    return jsonError(error);
  }
}
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    ids.parse(params.id);
    mutationGuard(request);
    const user = await requireManager();
    const data = await parseBody(request, schema);
    const result = await prisma.employee.updateMany({
      where: { id: params.id, organizationId: user.organizationId! },
      data,
    });
    if (!result.count)
      throw new ApiError(404, "NOT_FOUND", "Employee not found");
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId!,
        actorId: user.id,
        action: "employee.updated",
        targetType: "Employee",
        targetId: params.id,
        metadata: data,
      },
    });
    const employee = await prisma.employee.findFirst({
        where: { id: params.id, organizationId: user.organizationId! },
      });
    return NextResponse.json({
      data: planFeatures[user.plan].departmentRiskAnalytics
        ? employee : employee && (({ riskScore: _riskScore, ...record }) => record)(employee),
    });
  } catch (error) {
    return jsonError(error);
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    ids.parse(params.id);
    mutationGuard(request);
    const user = await requireManager();
    const result = await prisma.employee.deleteMany({
      where: { id: params.id, organizationId: user.organizationId! },
    });
    if (!result.count)
      throw new ApiError(404, "NOT_FOUND", "Employee not found");
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId!,
        actorId: user.id,
        action: "employee.deleted",
        targetType: "Employee",
        targetId: params.id,
      },
    });
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    return jsonError(error);
  }
}
