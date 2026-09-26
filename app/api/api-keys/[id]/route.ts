export const dynamic = "force-dynamic";
import { ids } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ApiError, jsonError, mutationGuard, requireManager } from "@/lib/api";
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    ids.parse(params.id);
    mutationGuard(request);
    const user = await requireManager();
    const result = await prisma.apiKey.updateMany({
      where: {
        id: params.id,
        organizationId: user.organizationId!,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
    if (!result.count)
      throw new ApiError(404, "NOT_FOUND", "Active key not found");
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId!,
        actorId: user.id,
        action: "api_key.revoked",
        targetType: "ApiKey",
        targetId: params.id,
      },
    });
    return NextResponse.json({ data: { revoked: true } });
  } catch (error) {
    return jsonError(error);
  }
}
