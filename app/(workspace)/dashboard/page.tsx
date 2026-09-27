import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Ban,
  Eye,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { number, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/workspace/page-heading";
import { TrendChart } from "@/components/workspace/trend-chart";
import { historyStart, planFeatures } from "@/lib/plans";
import { openIncidentStatuses } from "@/lib/incident-triage";
import { IncidentStatusBadge } from "@/components/workspace/incident-status-badge";
export const metadata = { title: "Overview" };
type DailyCount = { day: string; total: number };
export default async function Page() {
  const session = await getSession();
  const id = session!.user.organizationId!;
  const organization = await prisma.organization.findUniqueOrThrow({
    where: { id }, select: { plan: true },
  });
  const riskEnabled = planFeatures[organization.plan].departmentRiskAnalytics;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const thirty = new Date(start.getTime() - 29 * 86400_000);
  const [
    todayGroups,
    incidents,
    employeeCount,
    departmentRisk,
    scans30,
    incidents30,
    queueGroups,
    topRisk,
    organizationRisk,
  ] = await Promise.all([
    prisma.scanEvent.groupBy({
      by: ["blocked", "masked"],
      where: { organizationId: id, createdAt: { gte: start } },
      _count: { _all: true },
    }),
    prisma.incident.findMany({
      where: { organizationId: id, occurredAt: { gte: historyStart(organization.plan) } },
      select: {
        id: true,
        tool: true,
        category: true,
        action: true,
        occurredAt: true,
        employee: { select: { name: true } },
      },
      orderBy: { occurredAt: "desc" },
      take: 5,
    }),
    prisma.employee.count({ where: { organizationId: id } }),
    riskEnabled ? prisma.employee.groupBy({
      by: ["department"],
      where: { organizationId: id },
      _avg: { riskScore: true },
    }) : Promise.resolve([]),
    prisma.$queryRaw<DailyCount[]>`
      SELECT "createdAt"::date::text AS day,
             COUNT(*)::integer AS total
      FROM "ScanEvent"
      WHERE "organizationId" = ${id} AND "createdAt" >= ${thirty}
      GROUP BY 1
    `,
    prisma.$queryRaw<DailyCount[]>`
      SELECT "occurredAt"::date::text AS day,
             COUNT(*)::integer AS total
      FROM "Incident"
      WHERE "organizationId" = ${id} AND "occurredAt" >= ${thirty}
      GROUP BY 1
    `,
    prisma.incident.groupBy({
      by: ["status"],
      where: { organizationId: id, occurredAt: { gte: historyStart(organization.plan) } },
      _count: { _all: true },
    }),
    riskEnabled ? prisma.employee.findMany({
      where: { organizationId: id },
      select: { id: true, name: true, department: true, riskScore: true },
      orderBy: { riskScore: "desc" }, take: 5,
    }) : Promise.resolve([]),
    riskEnabled ? prisma.employee.aggregate({
      where: { organizationId: id }, _avg: { riskScore: true },
    }) : Promise.resolve(null),
  ]);
  const queue = new Map(queueGroups.map((row) => [row.status, row._count._all]));
  const openCount = openIncidentStatuses.reduce((count, status) => count + (queue.get(status) ?? 0), 0);
  const todayScans = todayGroups.reduce((total, group) => total + group._count._all, 0);
  const todayBlocked = todayGroups.reduce(
    (total, group) => total + (group.blocked ? group._count._all : 0),
    0,
  );
  const todayMasked = todayGroups.reduce(
    (total, group) => total + (group.masked ? group._count._all : 0),
    0,
  );
  const scanCounts = new Map(scans30.map((row) => [row.day, row.total]));
  const incidentCounts = new Map(incidents30.map((row) => [row.day, row.total]));
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(thirty.getTime() + i * 86400_000);
    const key = d.toISOString().slice(0, 10);
    return {
      key,
      date: dateFormatter.format(d),
      scans: scanCounts.get(key) ?? 0,
      incidents: incidentCounts.get(key) ?? 0,
    };
  });
  const dept = departmentRisk
    .map((row) => ({
      name: row.department,
      score: Math.round(row._avg.riskScore ?? 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  return (
    <>
      <PageHeading
        eyebrow="Overview"
        title="Security at a glance"
        description="A live view of AI activity, exposure, and policy outcomes across your organization."
        action={
          <Link
            href="/incidents"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          >
            Investigate incidents <ArrowUpRight size={16} />
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Requests scanned today",
            value: todayScans,
            icon: Activity,
            note: "Across connected AI tools",
            tone: "text-accent",
          },
          {
            label: "Blocked today",
            value: todayBlocked,
            icon: Ban,
            note: "High-risk prompts stopped",
            tone: "text-danger",
          },
          {
            label: "Masked today",
            value: todayMasked,
            icon: Eye,
            note: "Sensitive spans removed",
            tone: "text-amber",
          },
          {
            label: "Active employees",
            value: employeeCount,
            icon: ShieldCheck,
            note: "Monitored team members",
            tone: "text-[#8dc8ff]",
          },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted">{k.label}</p>
                <Icon size={19} className={k.tone} />
              </div>
              <p className="mt-5 text-3xl font-bold text-white">
                {number(k.value)}
              </p>
              <p className="mt-2 text-xs text-muted">{k.note}</p>
            </Card>
          );
        })}
      </div>
      <div className={`mt-5 grid gap-5 ${riskEnabled ? "xl:grid-cols-[1.7fr_1fr]" : ""}`}>
        <Card className="p-6">
          <TrendChart data={dates} />
        </Card>
        {riskEnabled && <Card className="p-6">
          <div className="mb-7 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Risk by department</h3>
              <p className="mt-1 text-xs text-muted">
                Average employee risk score
              </p>
            </div>
            <Sparkles size={18} className="text-accent" />
          </div>
          {dept.length ? (
            <div className="space-y-5">
              {dept.map((d) => (
                <div key={d.name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-[#d0dddd]">{d.name}</span>
                    <span
                      className={
                          d.score > 66
                            ? "font-semibold text-danger"
                            : d.score >= 34
                            ? "font-semibold text-amber"
                            : "font-semibold text-accent"
                      }
                    >
                      {d.score}/100
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface">
                    <div
                      className={`h-2 rounded-full ${d.score > 66 ? "bg-danger" : d.score >= 34 ? "bg-amber" : "bg-accent"}`}
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
              Add employees to see department risk.
            </p>
          )}
          <Link
            href="/employees"
            className="mt-8 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
          >
            View all employees <ArrowRight size={14} />
          </Link>
        </Card>}
      </div>
      <div className={`mt-5 grid gap-5 ${riskEnabled ? "xl:grid-cols-2" : ""}`}>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div><h3 className="font-semibold text-white">SOC triage queue</h3>
              <p className="mt-1 text-xs text-muted">Incidents in the visible history window</p></div>
            <Link href="/incidents" className="text-xs font-semibold text-accent hover:underline">View queue</Link>
          </div>
          <p className="mt-5 text-3xl font-bold text-white">{number(openCount)} <span className="text-sm font-normal text-muted">open</span></p>
          <div className="mt-5 flex flex-wrap gap-3">
            {(["NEW", "ACKNOWLEDGED", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE"] as const).map((status) => (
              <span key={status} className="flex items-center gap-2 text-xs text-muted">
                <IncidentStatusBadge status={status} /> {number(queue.get(status) ?? 0)}
              </span>
            ))}
          </div>
        </Card>
        {riskEnabled && <Card className="p-6">
          <h3 className="font-semibold text-white">Highest-risk employees</h3>
          <p className="mt-1 text-xs text-muted">Organization average: {Math.round(organizationRisk?._avg.riskScore ?? 0)}/100</p>
          <div className="mt-4 divide-y divide-line">
            {topRisk.map((employee) => <Link key={employee.id} href={`/employees/${employee.id}`}
              className="flex items-center justify-between gap-3 py-2 text-sm hover:text-accent">
              <span><span className="text-white">{employee.name}</span><span className="ml-2 text-xs text-muted">{employee.department}</span></span>
              <span className={employee.riskScore > 66 ? "font-semibold text-danger" : employee.riskScore >= 34 ? "font-semibold text-amber" : "font-semibold text-accent"}>{employee.riskScore}/100</span>
            </Link>)}
            {!topRisk.length && <p className="py-3 text-sm text-muted">No employees yet.</p>}
          </div>
        </Card>}
      </div>
      <Card className="mt-5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <h3 className="font-semibold text-white">Recent flagged events</h3>
            <p className="mt-1 text-xs text-muted">
              Latest policy decisions across your workspace
            </p>
          </div>
          <Link
            href="/incidents"
            className="text-xs font-semibold text-accent hover:underline"
          >
            View all
          </Link>
        </div>
        {incidents.length ? (
          <div className="table-scroll overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface/40 text-xs text-muted">
                <tr>
                  {["Employee", "AI tool", "Data type", "Action", "Time"].map(
                    (h) => (
                      <th key={h} className="px-6 py-3 font-medium">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {incidents.map((item) => (
                  <tr key={item.id} className="border-t border-line/70">
                    <td className="px-6 py-4 font-medium text-white">
                      {item.employee?.name ?? "Unattributed"}
                    </td>
                    <td className="px-6 py-4 text-muted">{item.tool}</td>
                    <td className="px-6 py-4 text-muted">
                      {item.category.replaceAll("_", " ")}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        tone={
                          item.action === "BLOCK"
                            ? "danger"
                            : item.action === "MASK"
                              ? "good"
                              : "warning"
                        }
                      >
                        {item.action === "ALERT"
                          ? "Alert only"
                          : item.action.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted">
                      {formatDate(item.occurredAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <ShieldCheck className="mx-auto mb-3 text-accent" />
            <p className="font-semibold text-white">No flagged events yet</p>
            <p className="mt-2 text-sm text-muted">
              Incidents appear after a connected gateway submits scans.
            </p>
          </div>
        )}
      </Card>
    </>
  );
}
