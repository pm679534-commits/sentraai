export const dynamic = "force-dynamic";
import { ids } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { IncidentStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  ApiError,
  jsonError,
  mutationGuard,
  parseBody,
  requireManager,
  requireUser,
} from "@/lib/api";
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    ids.parse(params.id);
    const user = await requireUser();
    const data = await prisma.incident.findFirst({
      where: { id: params.id, organizationId: user.organizationId! },
      include: { employee: true },
    });
    if (!data) throw new ApiError(404, "NOT_FOUND", "Incident not found");
    return NextResponse.json({ data });
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
    const { status } = await parseBody(
      request,
      z.object({ status: z.nativeEnum(IncidentStatus) }),
    );
    const result = await prisma.incident.updateMany({
      where: { id: params.id, organizationId: user.organizationId! },
      data: { status, reviewedAt: status === "OPEN" ? null : new Date() },
    });
    if (!result.count)
      throw new ApiError(404, "NOT_FOUND", "Incident not found");
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId!,
        actorId: user.id,
        action: "incident.status_changed",
        targetType: "Incident",
        targetId: params.id,
        metadata: { status },
      },
    });
    return NextResponse.json({
      data: await prisma.incident.findFirst({
        where: { id: params.id, organizationId: user.organizationId! },
      }),
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
    const result = await prisma.incident.deleteMany({
      where: { id: params.id, organizationId: user.organizationId! },
    });
    if (!result.count)
      throw new ApiError(404, "NOT_FOUND", "Incident not found");
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId!,
        actorId: user.id,
        action: "incident.deleted",
        targetType: "Incident",
        targetId: params.id,
      },
    });
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    return jsonError(error);
  }
}
