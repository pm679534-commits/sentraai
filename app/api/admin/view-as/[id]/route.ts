export const dynamic = "force-dynamic";
import { ids } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  ApiError,
  jsonError,
  mutationGuard,
  requireInternalAdmin,
} from "@/lib/api";
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    ids.parse(params.id);
    mutationGuard(request);
    const actor = await requireInternalAdmin();
    const org = await prisma.organization.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        plan: true,
        status: true,
        _count: { select: { employees: true, incidents: true, users: true } },
      },
    });
    if (!org) throw new ApiError(404, "NOT_FOUND", "Tenant not found");
    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        organizationId: org.id,
        action: "tenant.viewed",
        targetType: "Organization",
        targetId: org.id,
      },
    });
    return NextResponse.json(
      { data: org },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return jsonError(error);
  }
}
