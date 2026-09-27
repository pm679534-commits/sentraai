import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PageHeading } from "@/components/workspace/page-heading";
import { IncidentExplorer } from "@/components/workspace/incident-explorer";
import { historyStart } from "@/lib/plans";
export const metadata = { title: "Incidents" };
export default async function Page() {
  const session = await getSession();
  const id = session!.user.organizationId!;
  const organization = await prisma.organization.findUniqueOrThrow({
    where: { id }, select: { plan: true },
  });
  const where = { organizationId: id, occurredAt: { gte: historyStart(organization.plan) } };
  const [rows, total, assignees] = await Promise.all([
    prisma.incident.findMany({
      where,
      include: {
        employee: {
          select: { id: true, name: true, email: true, department: true },
        },
        assignedToUser: { select: { id: true, name: true } },
      },
      orderBy: { occurredAt: "desc" },
      take: 25,
    }),
    prisma.incident.count({ where }),
    prisma.user.findMany({
      where: { organizationId: id, role: { in: ["OWNER", "ADMIN", "MEMBER"] } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
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
          resolvedAt: r.resolvedAt?.toISOString() ?? null,
        }))}
        initialTotal={total}
        canManage={session!.user.role !== "MEMBER"}
        assignees={assignees}
      />
    </>
  );
}
