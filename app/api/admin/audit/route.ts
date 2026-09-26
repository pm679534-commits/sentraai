export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireInternalAdmin } from "@/lib/api";
export async function GET() {
  try {
    await requireInternalAdmin();
    const data = await prisma.auditLog.findMany({
      include: {
        actor: { select: { name: true, email: true } },
        organization: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(error);
  }
}
