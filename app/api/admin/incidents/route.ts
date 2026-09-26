export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireInternalAdmin } from "@/lib/api";
export async function GET() {
  try {
    await requireInternalAdmin();
    const [data, total, blocked] = await Promise.all([
      prisma.incident.findMany({
        include: {
          organization: { select: { name: true } },
          employee: { select: { name: true } },
        },
        orderBy: { occurredAt: "desc" },
        take: 100,
      }),
      prisma.incident.count(),
      prisma.incident.count({ where: { action: "BLOCK" } }),
    ]);
    return NextResponse.json({ data, summary: { total, blocked } });
  } catch (error) {
    return jsonError(error);
  }
}
