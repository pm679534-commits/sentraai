import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  Clock3,
  Server,
  ShieldAlert,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/workspace/page-heading";
import { number, formatDate } from "@/lib/utils";
export const metadata = { title: "Admin overview" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const [tenants, employees, incidents, blocked, latest] = await Promise.all([
    prisma.organization.count(),
    prisma.employee.count(),
    prisma.incident.count(),
    prisma.incident.count({ where: { action: "BLOCK" } }),
    prisma.incident.findMany({
      include: { organization: { select: { name: true } } },
      orderBy: { occurredAt: "desc" },
      take: 6,
    }),
  ]);
  return (
    <>
      <PageHeading
        eyebrow="Internal overview"
        title="Platform operations"
        description="Cross-tenant posture, service health, and recent security activity."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Customer tenants", value: tenants, icon: Building2 },
          { title: "Monitored employees", value: employees, icon: Users },
          { title: "Total incidents", value: incidents, icon: Activity },
          { title: "Blocked requests", value: blocked, icon: ShieldAlert },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.title} className="p-5">
              <div className="flex justify-between text-xs text-muted">
                {m.title}
                <Icon size={18} className="text-accent" />
              </div>
              <p className="mt-5 text-3xl font-bold text-white">
                {number(m.value)}
              </p>
            </Card>
          );
        })}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <h2 className="font-semibold text-white">
              Latest platform incidents
            </h2>
            <Link
              href="/admin/incidents"
              className="text-xs font-semibold text-accent"
            >
              View all <ArrowRight className="inline" size={13} />
            </Link>
          </div>
          {latest.length ? (
            <div className="divide-y divide-line">
              {latest.map((i) => (
                <div key={i.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger/10 text-danger">
                    <ShieldAlert size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {i.category.replaceAll("_", " ")} · {i.organization.name}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {i.tool} · {formatDate(i.occurredAt)}
                    </p>
                  </div>
                  <Badge
                    tone={
                      i.action === "BLOCK"
                        ? "danger"
                        : i.action === "MASK"
                          ? "good"
                          : "warning"
                    }
                  >
                    {i.action.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-8 text-center text-sm text-muted">
              No incidents have been recorded.
            </p>
          )}
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Server className="text-accent" size={20} />
            <div>
              <h2 className="font-semibold text-white">System health</h2>
              <p className="mt-1 text-xs text-muted">Demo telemetry snapshot</p>
            </div>
          </div>
          <div className="mt-7 space-y-4">
            {[
              { label: "API latency", value: "42 ms", tone: "good" as const },
              {
                label: "Detection engine uptime",
                value: "99.98%",
                tone: "good" as const,
              },
              {
                label: "Database connection",
                value: "Operational",
                tone: "good" as const,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between rounded-lg border border-line bg-ink/40 p-4 text-sm"
              >
                <span className="text-muted">{row.label}</span>
                <span className="font-semibold text-accent">{row.value}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 flex gap-2 text-xs leading-5 text-muted">
            <Clock3 size={14} className="shrink-0" /> Metrics shown here are
            illustrative for the investor demo.
          </p>
        </Card>
      </div>
    </>
  );
}
