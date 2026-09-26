import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/workspace/page-heading";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
export const metadata = { title: "Admin audit log" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const rows = await prisma.auditLog.findMany({
    where: { actor: { role: "INTERNAL_ADMIN" } },
    include: {
      actor: { select: { name: true, email: true } },
      organization: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <>
      <PageHeading
        eyebrow="Accountability"
        title="Admin audit log"
        description="Every sensitive internal action is recorded with actor, target, and time."
      />
      <Card className="overflow-hidden">
        {rows.length ? (
          <div className="table-scroll overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface/40 text-xs text-muted">
                <tr>
                  {["Time", "Actor", "Action", "Tenant", "Target"].map((h) => (
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
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-5 py-4 font-medium text-white">
                      {r.actor?.name ?? "System"}
                    </td>
                    <td className="px-5 py-4 text-accent">
                      {r.action.replaceAll(".", " · ")}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {r.organization?.name ?? "—"}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-muted">
                      {r.targetType} {r.targetId?.slice(0, 8)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="font-semibold text-white">No admin actions yet</p>
            <p className="mt-2 text-sm text-muted">
              Tenant changes and read-only tenant views appear here.
            </p>
          </div>
        )}
      </Card>
    </>
  );
}
