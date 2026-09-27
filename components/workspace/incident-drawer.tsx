"use client";
import { useState } from "react";
import type { IncidentStatus } from "@prisma/client";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IncidentStatusBadge } from "@/components/workspace/incident-status-badge";
import { incidentTransitions } from "@/lib/incident-triage";
import { formatDate } from "@/lib/utils";

export type IncidentRecord = {
  id: string;
  tool: string;
  category: string;
  action: "MASK" | "BLOCK" | "ALERT";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: IncidentStatus;
  matchCount: number;
  source: string;
  occurredAt: string;
  reviewedAt: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  assignedToUserId: string | null;
  assignedToUser: { id: string; name: string } | null;
  employee: { id: string; name: string; email: string; department: string } | null;
};

export function IncidentDrawer({
  incident, assignees, canManage, onClose, onUpdated,
}: {
  incident: IncidentRecord;
  assignees: { id: string; name: string }[];
  canManage: boolean;
  onClose: () => void;
  onUpdated: (value: IncidentRecord) => void;
}) {
  const [status, setStatus] = useState(incident.status);
  const [assignee, setAssignee] = useState(incident.assignedToUserId ?? "");
  const [note, setNote] = useState(incident.resolutionNote ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const closing = status === "RESOLVED" || status === "FALSE_POSITIVE";
  const changed = status !== incident.status || assignee !== (incident.assignedToUserId ?? "");

  async function save() {
    if (!changed) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/incidents/${incident.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(status !== incident.status ? { status } : {}),
          ...(assignee !== (incident.assignedToUserId ?? "")
            ? { assignedToUserId: assignee || null } : {}),
          ...(closing && status !== incident.status ? { resolutionNote: note.trim() } : {}),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Could not update incident");
      onUpdated(body.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update incident");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/65" role="dialog" aria-modal="true" aria-label="Incident details">
      <button className="flex-1" onClick={onClose} aria-label="Close details" />
      <div className="h-full w-full max-w-lg overflow-y-auto border-l border-line bg-panel p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">Incident details</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{incident.category.replaceAll("_", " ")} detected</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white" aria-label="Close"><X size={21} /></button>
        </div>
        <div className="mt-7 flex flex-wrap gap-2">
          <Badge tone={incident.action === "BLOCK" ? "danger" : incident.action === "MASK" ? "good" : "warning"}>
            {incident.action === "ALERT" ? "Alert only" : incident.action.toLowerCase()}
          </Badge>
          <Badge tone={incident.severity === "HIGH" || incident.severity === "CRITICAL" ? "danger" : "warning"}>
            {incident.severity.toLowerCase()} severity
          </Badge>
          <IncidentStatusBadge status={incident.status} />
        </div>
        <div className="mt-7 divide-y divide-line rounded-xl border border-line bg-ink/50 px-4">
          {[
            ["Time", formatDate(incident.occurredAt)],
            ["Employee", incident.employee?.name ?? "Unattributed"],
            ["Department", incident.employee?.department ?? "—"],
            ["AI tool", incident.tool],
            ["Data category", incident.category.replaceAll("_", " ")],
            ["Matches", String(incident.matchCount)],
            ["Source", incident.source],
            ["Assigned to", incident.assignedToUser?.name ?? "Unassigned"],
            ...(incident.resolvedAt ? [["Resolved", formatDate(incident.resolvedAt)]] : []),
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 py-3.5 text-sm">
              <span className="text-muted">{label}</span>
              <span className="text-right font-medium text-white">{value}</span>
            </div>
          ))}
        </div>
        {incident.resolutionNote && (
          <div className="mt-5 rounded-xl border border-line bg-ink/50 p-4">
            <p className="text-xs font-semibold text-muted">Resolution note</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-white">{incident.resolutionNote}</p>
          </div>
        )}
        <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-4">
          <p className="text-sm font-semibold text-accent">Privacy-preserving record</p>
          <p className="mt-1 text-xs leading-5 text-muted">Only detection metadata is stored. The original prompt and detected values are not retained.</p>
        </div>
        {canManage && (
          <div className="mt-7 space-y-5">
            <label className="block text-xs font-semibold text-muted">
              Triage status
              <select value={status} disabled={saving || incidentTransitions[incident.status].length === 0}
                onChange={(event) => setStatus(event.target.value as IncidentStatus)}
                className="focus-ring mt-2 h-11 w-full rounded-lg border border-line bg-ink px-3 text-sm text-white">
                <option value={incident.status}>{incident.status.replaceAll("_", " ")}</option>
                {incidentTransitions[incident.status].map((next) => <option key={next} value={next}>{next.replaceAll("_", " ")}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-muted">
              Assigned analyst
              <select value={assignee} disabled={saving} onChange={(event) => setAssignee(event.target.value)}
                className="focus-ring mt-2 h-11 w-full rounded-lg border border-line bg-ink px-3 text-sm text-white">
                <option value="">Unassigned</option>
                {assignees.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
              </select>
            </label>
            {closing && status !== incident.status && (
              <label className="block text-xs font-semibold text-muted">
                Resolution note
                <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000}
                  rows={4} required placeholder="Explain the resolution or false positive"
                  className="focus-ring mt-2 w-full rounded-lg border border-line bg-ink p-3 text-sm text-white" />
              </label>
            )}
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <Button onClick={save} disabled={saving || !changed || (closing && status !== incident.status && !note.trim())}>
              {saving ? "Saving…" : "Save triage"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
