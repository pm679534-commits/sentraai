"use client";
import { useMemo, useState, type FormEvent } from "react";
import { Plus, Search, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { number } from "@/lib/utils";
type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  riskScore: number;
  requestCount: number;
  createdAt: string;
  organizationId: string;
};
export function EmployeeTable({
  initial,
  canManage,
}: {
  initial: Employee[];
  canManage: boolean;
}) {
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        `${r.name} ${r.email} ${r.department}`
          .toLowerCase()
          .includes(q.toLowerCase()),
      ),
    [rows, q],
  );
  async function add(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, department }),
      });
      const body = await r.json();
      if (!r.ok)
        throw new Error(body.error?.message ?? "Could not add employee");
      setRows([body.data, ...rows]);
      setOpen(false);
      setName("");
      setEmail("");
      setDepartment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Monitored employees", value: rows.length },
          {
            label: "Departments",
            value: new Set(rows.map((r) => r.department)).size,
          },
          {
            label: "Total requests",
            value: rows.reduce((s, r) => s + r.requestCount, 0),
          },
        ].map((m) => (
          <Card key={m.label} className="p-5">
            <p className="text-xs text-muted">{m.label}</p>
            <p className="mt-3 text-2xl font-bold text-white">
              {number(m.value)}
            </p>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-line p-5 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search size={17} className="absolute left-3 top-3 text-muted" />
            <Input
              className="pl-10"
              placeholder="Search people or teams"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          {canManage && (
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus size={16} /> Add employee
            </Button>
          )}
        </div>
        {filtered.length ? (
          <div className="table-scroll overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface/40 text-xs text-muted">
                <tr>
                  {[
                    "Employee",
                    "Department",
                    "AI requests",
                    "Risk level",
                    "Risk score",
                  ].map((h) => (
                    <th key={h} className="px-5 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-line/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-xs font-bold text-white">
                          {r.name
                            .split(" ")
                            .map((x) => x[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{r.name}</p>
                          <p className="mt-0.5 text-xs text-muted">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted">{r.department}</td>
                    <td className="px-5 py-4 text-white">
                      {number(r.requestCount)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        tone={
                          r.riskScore >= 50
                            ? "danger"
                            : r.riskScore >= 30
                              ? "warning"
                              : "good"
                        }
                      >
                        {r.riskScore >= 50
                          ? "High"
                          : r.riskScore >= 30
                            ? "Medium"
                            : "Low"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-20 rounded-full bg-surface">
                          <div
                            className={`h-1.5 rounded-full ${r.riskScore >= 50 ? "bg-danger" : r.riskScore >= 30 ? "bg-amber" : "bg-accent"}`}
                            style={{ width: `${Math.min(100, r.riskScore)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted">
                          {r.riskScore}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="mx-auto mb-3 text-accent" size={28} />
            <p className="font-semibold text-white">
              {q ? "No matching employees" : "No employees yet"}
            </p>
            <p className="mt-2 text-sm text-muted">
              {q
                ? "Try a different name or department."
                : "Add your first employee to start tracking activity."}
            </p>
          </div>
        )}
      </Card>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add employee"
        >
          <div className="w-full max-w-md rounded-2xl border border-line bg-panel p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Add employee</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-white"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={add} className="space-y-4">
              <label className="block text-sm">
                Full name
                <Input
                  className="mt-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
              <label className="block text-sm">
                Work email
                <Input
                  className="mt-2"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="block text-sm">
                Department
                <Input
                  className="mt-2"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </label>
              {error && (
                <p role="alert" className="text-sm text-danger">
                  {error}
                </p>
              )}
              <Button className="w-full" disabled={busy}>
                {busy ? "Adding…" : "Add employee"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
