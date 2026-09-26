import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PageHeading } from "@/components/workspace/page-heading";
import { IncidentExplorer } from "@/components/workspace/incident-explorer";
export const metadata = { title: "Incidents" };
export default async function Page() {
  const session = await getSession();
  const id = session!.user.organizationId!;
  const [rows, total] = await Promise.all([
    prisma.incident.findMany({
      where: { organizationId: id },
      include: {
        employee: {
          select: { id: true, name: true, email: true, department: true },
        },
      },
      orderBy: { occurredAt: "desc" },
      take: 25,
    }),
    prisma.incident.count({ where: { organizationId: id } }),
  ]);
  return (
    <>
      <PageHeading
        eyebrow="Investigations"
        title="Incident activity"
        description="Every flagged AI request, with the context your team needs to act."
      />
      <IncidentExplorer
        initial={rows.map((r) => ({
          ...r,
          occurredAt: r.occurredAt.toISOString(),
          reviewedAt: r.reviewedAt?.toISOString() ?? null,
        }))}
        initialTotal={total}
        canManage={session!.user.role !== "MEMBER"}
      />
    </>
  );
}
