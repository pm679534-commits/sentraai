export const dynamic = "force-dynamic";
import { ids } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { OrgStatus, Plan } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  ApiError,
  jsonError,
  mutationGuard,
  parseBody,
  requireInternalAdmin,
} from "@/lib/api";
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    ids.parse(params.id);
    mutationGuard(request);
    const actor = await requireInternalAdmin();
    const data = await parseBody(
      request,
      z
        .object({
          status: z.nativeEnum(OrgStatus).optional(),
          plan: z.nativeEnum(Plan).optional(),
        })
        .refine((v) => Object.keys(v).length > 0),
    );
    const current = await prisma.organization.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!current) throw new ApiError(404, "NOT_FOUND", "Tenant not found");
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.organization.update({
        where: { id: params.id },
        data,
      });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          organizationId: tenant.id,
          action: "tenant.updated",
          targetType: "Organization",
          targetId: tenant.id,
          metadata: data,
        },
      });
      return tenant;
    });
    return NextResponse.json({ data: result });
  } catch (error) {
    return jsonError(error);
  }
}
