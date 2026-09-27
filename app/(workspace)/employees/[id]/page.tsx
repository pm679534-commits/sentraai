import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { historyStart, planFeatures } from "@/lib/plans";
import { PageHeading } from "@/components/workspace/page-heading";
import { EmployeeTimeline } from "@/components/workspace/employee-timeline";

export const metadata = { title: "Employee investigation" };

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getSession();
  const organizationId = session!.user.organizationId!;
  const organization = await prisma.organization.findUniqueOrThrow({
    where: { id: organizationId }, select: { plan: true },
  });
  const since = historyStart(organization.plan);
  const employee = await prisma.employee.findFirst({
    where: { id: params.id, organizationId },
    select: { id: true, name: true, email: true, department: true, riskScore: true },
  });
  if (!employee) notFound();
  const [incidents, assignees] = await Promise.all([
    prisma.incident.findMany({
      where: { organizationId, employeeId: employee.id, occurredAt: { gte: since } },
      include: {
        employee: { select: { id: true, name: true, email: true, department: true } },
        assignedToUser: { select: { id: true, name: true } },
      },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.user.findMany({
      where: { organizationId, role: { in: ["OWNER", "ADMIN", "MEMBER"] } },
      select: { id: true, name: true }, orderBy: { name: "asc" },
    }),
  ]);
  const incidentIds = new Set(incidents.map((incident) => incident.id));
  const audits = await prisma.auditLog.findMany({
    where: {
      organizationId, createdAt: { gte: since },
      OR: [
        { targetType: "Incident", targetId: { in: [...incidentIds] }, action: { in: ["incident.status_changed", "incident.assignment_changed"] } },
        { targetType: "Employee", targetId: employee.id, action: "employee.risk_score_changed" },
      ],
    },
    select: {
      id: true, createdAt: true, action: true, targetId: true, metadata: true,
      actor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  const events = [
    ...incidents.map((incident) => ({
      id: `incident-${incident.id}`,
      at: incident.occurredAt.toISOString(),
      incidentId: incident.id,
      label: `${incident.category.replaceAll("_", " ")} detected · ${incident.severity.toLowerCase()} severity`,
      status: incident.status,
    })),
    ...audits.flatMap((audit) => {
      const metadata = audit.metadata && typeof audit.metadata === "object" && !Array.isArray(audit.metadata)
        ? audit.metadata as Record<string, unknown> : {};
      const incidentId = audit.action === "employee.risk_score_changed"
        ? metadata.incidentId : audit.targetId;
      if (typeof incidentId !== "string" || !incidentIds.has(incidentId)) return [];
      if (audit.action === "employee.risk_score_changed" &&
          !planFeatures[organization.plan].departmentRiskAnalytics) return [];
      const label = audit.action === "employee.risk_score_changed"
        ? `Risk score changed: ${metadata.fromScore} → ${metadata.toScore}`
        : audit.action === "incident.assignment_changed"
          ? `Incident assignment changed by ${audit.actor?.name ?? "an analyst"}`
          : `Status changed: ${String(metadata.fromStatus ?? "unknown").replaceAll("_", " ")} → ${String(metadata.toStatus ?? "unknown").replaceAll("_", " ")} by ${audit.actor?.name ?? "an analyst"}`;
      return [{ id: audit.id, at: audit.createdAt.toISOString(), incidentId, label, status: null }];
    }),
  ].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <>
      <div className="mb-4"><Link href="/employees" className="text-sm font-semibold text-accent hover:underline">← All employees</Link></div>
      <PageHeading eyebrow="Employee investigation" title={employee.name}
        description={`${employee.department} · ${employee.email}`} />
      <EmployeeTimeline
        employee={{ ...employee, riskScore: planFeatures[organization.plan].departmentRiskAnalytics ? employee.riskScore : null }}
        historyDays={planFeatures[organization.plan].incidentHistoryDays}
        incidents={incidents.map((incident) => ({
          ...incident,
          occurredAt: incident.occurredAt.toISOString(),
          reviewedAt: incident.reviewedAt?.toISOString() ?? null,
          resolvedAt: incident.resolvedAt?.toISOString() ?? null,
        }))}
        events={events}
        assignees={assignees}
        canManage={session!.user.role !== "MEMBER"}
      />
    </>
  );
}
