"use client";
import { useEffect, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

type Incident = {
  id: string;
  tool: string;
  category: string;
  action: "MASK" | "BLOCK" | "ALERT";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "REVIEWED" | "RESOLVED";
  matchCount: number;
  source: string;
  occurredAt: string;
  reviewedAt: string | null;
  employee: {
    id: string;
    name: string;
    email: string;
    department: string;
  } | null;
};

export function IncidentExplorer({
  initial,
  initialTotal,
  canManage,
}: {
  initial: Incident[];
  initialTotal: number;
  canManage: boolean;
}) {
  const [rows, setRows] = useState(initial);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      q: query,
      action,
      status,
    });
    fetch(`/api/incidents?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.error?.message ?? "Could not load incidents");
        setRows(body.data);
        setTotal(body.pagination.total);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [page, query, action, status]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setQuery(search.trim());
  }
  async function updateStatus(next: Incident["status"]) {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/incidents/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error?.message ?? "Could not update incident");
      const changed = {
        ...selected,
        status: next,
        reviewedAt: body.data.reviewedAt,
      };
      setSelected(changed);
      setRows((current) =>
        current.map((row) => (row.id === selected.id ? changed : row)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update incident",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-5 lg:flex-row">
          <form onSubmit={onSearch} className="relative min-w-0 flex-1">
            <Search size={17} className="absolute left-3 top-3 text-muted" />
            <Input
              className="pl-10"
              placeholder="Search tool, category, employee"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <select
            aria-label="Filter by action"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            className="focus-ring h-11 rounded-lg border border-line bg-ink px-3 text-sm text-muted"
          >
            <option value="">All actions</option>
            <option value="BLOCK">Blocked</option>
            <option value="MASK">Masked</option>
            <option value="ALERT">Alert only</option>
          </select>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="focus-ring h-11 rounded-lg border border-line bg-ink px-3 text-sm text-muted"
          >
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
        {error && (
          <p
            role="alert"
            className="border-b border-danger/20 bg-danger/10 px-5 py-3 text-sm text-danger"
          >
            {error}
          </p>
        )}
        {loading ? (
          <div className="space-y-3 p-6" aria-label="Loading incidents">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-surface"
              />
            ))}
          </div>
        ) : rows.length ? (
          <div className="table-scroll overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface/40 text-xs text-muted">
                <tr>
                  {[
                    "Time",
                    "Employee",
                    "AI tool",
                    "Detected data",
                    "Action",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-5 py-3 font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelected(row)}
                    className="cursor-pointer border-t border-line/70 hover:bg-surface/35"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {formatDate(row.occurredAt)}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">
                        {row.employee?.name ?? "Unattributed"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {row.employee?.department ?? "Gateway"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-white">{row.tool}</td>
                    <td className="px-5 py-4 text-muted">
                      {row.category.replaceAll("_", " ")}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        tone={
                          row.action === "BLOCK"
                            ? "danger"
                            : row.action === "MASK"
                              ? "good"
                              : "warning"
                        }
                      >
                        {row.action === "ALERT"
                          ? "Alert only"
                          : row.action.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge>{row.status.toLowerCase()}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-14 text-center">
            <AlertTriangle className="mx-auto mb-3 text-accent" size={28} />
            <p className="font-semibold text-white">No incidents found</p>
            <p className="mt-2 text-sm text-muted">
              Try another filter, or connect your gateway to start seeing
              events.
            </p>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-line px-5 py-4 text-xs text-muted">
          <span>{total} incidents</span>
          <div className="flex items-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              Page {page} of {Math.max(1, Math.ceil(total / 25))}
            </span>
            <button
              disabled={page >= Math.ceil(total / 25)}
              onClick={() => setPage(page + 1)}
              className="disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </Card>
      {selected && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/65"
          role="dialog"
          aria-modal="true"
          aria-label="Incident details"
        >
          <button
            className="flex-1"
            onClick={() => setSelected(null)}
            aria-label="Close details"
          />
          <div className="h-full w-full max-w-lg overflow-y-auto border-l border-line bg-panel p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-accent">
                  Incident details
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  {selected.category.replaceAll("_", " ")} detected
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-muted hover:text-white"
                aria-label="Close"
              >
                <X size={21} />
              </button>
            </div>
            <div className="mt-7 flex gap-2">
              <Badge
                tone={
                  selected.action === "BLOCK"
                    ? "danger"
                    : selected.action === "MASK"
                      ? "good"
                      : "warning"
                }
              >
                {selected.action === "ALERT"
                  ? "Alert only"
                  : selected.action.toLowerCase()}
              </Badge>
              <Badge
                tone={
                  selected.severity === "HIGH" ||
                  selected.severity === "CRITICAL"
                    ? "danger"
                    : "warning"
                }
              >
                {selected.severity.toLowerCase()} severity
              </Badge>
            </div>
            <div className="mt-7 divide-y divide-line rounded-xl border border-line bg-ink/50 px-4">
              {[
                ["Time", formatDate(selected.occurredAt)],
                ["Employee", selected.employee?.name ?? "Unattributed"],
                ["Department", selected.employee?.department ?? "—"],
                ["AI tool", selected.tool],
                ["Data category", selected.category.replaceAll("_", " ")],
                ["Matches", String(selected.matchCount)],
                ["Source", selected.source],
                ["Status", selected.status.toLowerCase()],
              ].map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between gap-3 py-3.5 text-sm"
                >
                  <span className="text-muted">{key}</span>
                  <span className="text-right font-medium text-white">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-4">
              <p className="text-sm font-semibold text-accent">
                Privacy-preserving record
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Only detection metadata is stored. The original prompt and
                detected values are not retained.
              </p>
            </div>
            {canManage && (
              <label className="mt-7 block text-xs font-semibold text-muted">
                Review status
                <select
                  disabled={saving}
                  value={selected.status}
                  onChange={(e) =>
                    updateStatus(e.target.value as Incident["status"])
                  }
                  className="focus-ring mt-2 h-11 w-full rounded-lg border border-line bg-ink px-3 text-sm text-white"
                >
                  <option value="OPEN">Open</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </label>
            )}
          </div>
        </div>
      )}
    </>
  );
}
