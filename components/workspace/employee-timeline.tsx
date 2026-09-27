"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { IncidentStatus } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { IncidentDrawer, type IncidentRecord } from "@/components/workspace/incident-drawer";
import { IncidentStatusBadge } from "@/components/workspace/incident-status-badge";
import { formatDate } from "@/lib/utils";

type TimelineEvent = {
  id: string;
  at: string;
  incidentId: string;
  label: string;
  status: IncidentStatus | null;
};

export function EmployeeTimeline({ employee, historyDays, incidents, events, assignees, canManage }: {
  employee: { id: string; name: string; riskScore: number | null };
  historyDays: number;
  incidents: IncidentRecord[];
  events: TimelineEvent[];
  assignees: { id: string; name: string }[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(incidents);
  const [selected, setSelected] = useState<IncidentRecord | null>(null);
  useEffect(() => setRows(incidents), [incidents]);
  const mostRecent = rows[0]?.occurredAt;
  const daysSince = mostRecent
    ? Math.max(0, Math.floor((Date.now() - new Date(mostRecent).getTime()) / 86_400_000))
    : null;

  return (
    <>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-xs text-muted">Visible incidents</p><p className="mt-3 text-2xl font-bold text-white">{rows.length}</p></Card>
        <Card className="p-5"><p className="text-xs text-muted">Days since last incident</p><p className="mt-3 text-2xl font-bold text-white">{daysSince ?? "—"}</p></Card>
        <Card className="p-5"><p className="text-xs text-muted">History window</p><p className="mt-3 text-2xl font-bold text-white">{historyDays} days</p></Card>
      </div>
      {employee.riskScore !== null && <Card className="mb-5 p-5">
        <p className="text-xs text-muted">Current risk score</p>
        <p className={employee.riskScore > 66 ? "mt-3 text-2xl font-bold text-danger" : employee.riskScore >= 34 ? "mt-3 text-2xl font-bold text-amber" : "mt-3 text-2xl font-bold text-accent"}>
          {employee.riskScore}/100
        </p>
      </Card>}
      <Card className="overflow-hidden">
        <div className="border-b border-line px-6 py-5"><h2 className="font-semibold text-white">Investigation timeline</h2></div>
        {events.length ? <ol className="divide-y divide-line">
          {events.map((event) => <li key={event.id}>
            <button onClick={() => setSelected(rows.find((incident) => incident.id === event.incidentId) ?? null)}
              className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left hover:bg-surface/35">
              <span>
                <span className="block text-sm font-medium text-white">{event.label}</span>
                <span className="mt-1 block text-xs text-muted">{formatDate(event.at)}</span>
              </span>
              {event.status && <IncidentStatusBadge status={event.status} />}
            </button>
          </li>)}
        </ol> : <p className="p-10 text-center text-sm text-muted">No incidents in the visible history window.</p>}
      </Card>
      {selected && <IncidentDrawer key={selected.id} incident={selected} assignees={assignees}
        canManage={canManage} onClose={() => setSelected(null)} onUpdated={(changed) => {
          setSelected(changed);
          setRows((current) => current.map((row) => row.id === changed.id ? changed : row));
          router.refresh();
        }} />}
    </>
  );
}
