import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/workspace/page-heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, number } from "@/lib/utils";
export const metadata = { title: "Global incidents" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const [rows, total, blocked, organizations] = await Promise.all([
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
    prisma.organization.count(),
  ]);
  return (
    <>
      <PageHeading
        eyebrow="Cross-tenant intelligence"
        title="Global incidents"
        description="Aggregate security activity across customer workspaces. Raw prompt content is never available."
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          ["Total incidents", total],
          ["Blocked requests", blocked],
          ["Customer tenants", organizations],
        ].map(([k, v]) => (
          <Card key={k} className="p-5">
            <p className="text-xs text-muted">{k}</p>
            <p className="mt-3 text-2xl font-bold text-white">
              {number(Number(v))}
            </p>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="border-b border-line px-6 py-5">
          <h2 className="font-semibold text-white">
            Recent incidents across tenants
          </h2>
          <p className="mt-1 text-xs text-muted">Latest 100 events</p>
        </div>
        {rows.length ? (
          <div className="table-scroll overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface/40 text-xs text-muted">
                <tr>
                  {[
                    "Time",
                    "Tenant",
                    "Employee",
                    "AI tool",
                    "Data type",
                    "Action",
                    "Severity",
                  ].map((h) => (
                    <th key={h} className="px-5 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-line/70">
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {formatDate(r.occurredAt)}
                    </td>
                    <td className="px-5 py-4 font-medium text-white">
                      {r.organization.name}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {r.employee?.name ?? "Unattributed"}
                    </td>
                    <td className="px-5 py-4 text-muted">{r.tool}</td>
                    <td className="px-5 py-4 text-muted">
                      {r.category.replaceAll("_", " ")}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        tone={
                          r.action === "BLOCK"
                            ? "danger"
                            : r.action === "MASK"
                              ? "good"
                              : "warning"
                        }
                      >
                        {r.action.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {r.severity.toLowerCase()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-12 text-center text-sm text-muted">
            No incidents have been recorded yet.
          </p>
        )}
      </Card>
    </>
  );
}
