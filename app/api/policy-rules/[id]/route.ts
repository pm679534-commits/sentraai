export const dynamic = "force-dynamic";
import { ids } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { Action } from "@prisma/client";
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
    const data = await prisma.policyRule.findFirst({
      where: { id: params.id, organizationId: user.organizationId! },
    });
    if (!data) throw new ApiError(404, "NOT_FOUND", "Rule not found");
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
    const data = await parseBody(
      request,
      z
        .object({
          enabled: z.boolean().optional(),
          action: z.nativeEnum(Action).optional(),
        })
        .refine((v) => Object.keys(v).length > 0),
    );
    const result = await prisma.policyRule.updateMany({
      where: { id: params.id, organizationId: user.organizationId! },
      data,
    });
    if (!result.count) throw new ApiError(404, "NOT_FOUND", "Rule not found");
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId!,
        actorId: user.id,
        action: "policy.updated",
        targetType: "PolicyRule",
        targetId: params.id,
        metadata: data,
      },
    });
    return NextResponse.json({
      data: await prisma.policyRule.findFirst({
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
    const result = await prisma.policyRule.deleteMany({
      where: { id: params.id, organizationId: user.organizationId! },
    });
    if (!result.count) throw new ApiError(404, "NOT_FOUND", "Rule not found");
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId!,
        actorId: user.id,
        action: "policy.deleted",
        targetType: "PolicyRule",
        targetId: params.id,
      },
    });
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    return jsonError(error);
  }
}
