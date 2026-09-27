"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IncidentDrawer, type IncidentRecord } from "@/components/workspace/incident-drawer";
import { IncidentStatusBadge } from "@/components/workspace/incident-status-badge";
import { formatDate } from "@/lib/utils";

export function IncidentExplorer({ initial, initialTotal, canManage, assignees }: {
  initial: IncidentRecord[];
  initialTotal: number;
  canManage: boolean;
  assignees: { id: string; name: string }[];
}) {
  const [rows, setRows] = useState(initial);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<IncidentRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), q: query, action, status });
    fetch(`/api/incidents?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Could not load incidents");
        setRows(body.data);
        setTotal(body.pagination.total);
      })
      .catch((cause) => {
        if (cause.name !== "AbortError") setError(cause.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page, query, action, status]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setQuery(search.trim());
  }

  function onUpdated(value: IncidentRecord) {
    setSelected(value);
    setRows((current) => status && status !== value.status
      ? current.filter((row) => row.id !== value.id)
      : current.map((row) => row.id === value.id ? value : row));
    if (status && status !== value.status) setTotal((count) => Math.max(0, count - 1));
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-5 lg:flex-row">
          <form onSubmit={onSearch} className="relative min-w-0 flex-1">
            <Search size={17} className="absolute left-3 top-3 text-muted" />
            <Input className="pl-10" placeholder="Search tool, category, employee" value={search}
              onChange={(event) => setSearch(event.target.value)} />
          </form>
          <select aria-label="Filter by action" value={action} onChange={(event) => {
            setAction(event.target.value); setPage(1);
          }} className="focus-ring h-11 rounded-lg border border-line bg-ink px-3 text-sm text-muted">
            <option value="">All actions</option>
            <option value="BLOCK">Blocked</option>
            <option value="MASK">Masked</option>
            <option value="ALERT">Alert only</option>
          </select>
          <select aria-label="Filter by status" value={status} onChange={(event) => {
            setStatus(event.target.value); setPage(1);
          }} className="focus-ring h-11 rounded-lg border border-line bg-ink px-3 text-sm text-muted">
            <option value="">All statuses</option>
            <option value="NEW">New</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESOLVED">Resolved</option>
            <option value="FALSE_POSITIVE">False positive</option>
          </select>
        </div>
        {error && <p role="alert" className="border-b border-danger/20 bg-danger/10 px-5 py-3 text-sm text-danger">{error}</p>}
        {loading ? (
          <div className="space-y-3 p-6" aria-label="Loading incidents">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-surface" />)}
          </div>
        ) : rows.length ? (
          <div className="table-scroll overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface/40 text-xs text-muted"><tr>
                {["Time", "Employee", "AI tool", "Detected data", "Action", "Status"].map((heading) =>
                  <th key={heading} className="whitespace-nowrap px-5 py-3 font-medium">{heading}</th>)}
              </tr></thead>
              <tbody>{rows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} onKeyDown={(event) => {
                  if (event.key === "Enter") setSelected(row);
                }} tabIndex={0} className="cursor-pointer border-t border-line/70 hover:bg-surface/35">
                  <td className="whitespace-nowrap px-5 py-4 text-muted">{formatDate(row.occurredAt)}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-white">{row.employee?.name ?? "Unattributed"}</p>
                    <p className="mt-0.5 text-xs text-muted">{row.employee?.department ?? "Gateway"}</p>
                  </td>
                  <td className="px-5 py-4 text-white">{row.tool}</td>
                  <td className="px-5 py-4 text-muted">{row.category.replaceAll("_", " ")}</td>
                  <td className="px-5 py-4"><Badge tone={row.action === "BLOCK" ? "danger" : row.action === "MASK" ? "good" : "warning"}>
                    {row.action === "ALERT" ? "Alert only" : row.action.toLowerCase()}
                  </Badge></td>
                  <td className="px-5 py-4"><IncidentStatusBadge status={row.status} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div className="p-14 text-center">
            <AlertTriangle className="mx-auto mb-3 text-accent" size={28} />
            <p className="font-semibold text-white">No incidents found</p>
            <p className="mt-2 text-sm text-muted">Try another filter, or connect your gateway to start seeing events.</p>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-line px-5 py-4 text-xs text-muted">
          <span>{total} incidents</span>
          <div className="flex items-center gap-3">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="disabled:opacity-30" aria-label="Previous page"><ChevronLeft size={18} /></button>
            <span>Page {page} of {Math.max(1, Math.ceil(total / 25))}</span>
            <button disabled={page >= Math.ceil(total / 25)} onClick={() => setPage(page + 1)} className="disabled:opacity-30" aria-label="Next page"><ChevronRight size={18} /></button>
          </div>
        </div>
      </Card>
      {selected && <IncidentDrawer key={selected.id} incident={selected} assignees={assignees}
        canManage={canManage} onClose={() => setSelected(null)} onUpdated={onUpdated} />}
    </>
  );
}
