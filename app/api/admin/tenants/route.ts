export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireInternalAdmin } from "@/lib/api";
export async function GET() {
  try {
    await requireInternalAdmin();
    const data = await prisma.organization.findMany({
      include: {
        _count: { select: { users: true, employees: true, incidents: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(error);
  }
}
