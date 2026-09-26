"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
type Tenant = {
  id: string;
  name: string;
  slug: string;
  industry: string;
  teamSize: string;
  plan: "STARTER" | "BUSINESS" | "ENTERPRISE";
  status: "ACTIVE" | "TRIAL" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
    employees: number;
    incidents: number;
    scans: number;
  };
};
export function TenantTable({ initial }: { initial: Tenant[] }) {
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  async function update(
    id: string,
    data: Partial<Pick<Tenant, "plan" | "status">>,
  ) {
    setSaving(id);
    setError("");
    try {
      const r = await fetch(`/api/admin/tenants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error?.message ?? "Could not update tenant");
      setRows(rows.map((row) => (row.id === id ? { ...row, ...data } : row)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update tenant");
    } finally {
      setSaving("");
    }
  }
  const filtered = rows.filter((r) =>
    `${r.name} ${r.industry}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line p-5">
        <div className="relative max-w-sm">
          <Search size={17} className="absolute left-3 top-3 text-muted" />
          <Input
            className="pl-10"
            placeholder="Search tenants"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="bg-danger/10 px-5 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      {filtered.length ? (
        <div className="table-scroll overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface/40 text-xs text-muted">
              <tr>
                {[
                  "Organization",
                  "Plan",
                  "Status",
                  "Employees",
                  "Scans",
                  "Incidents",
                  "View",
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
                    <p className="font-semibold text-white">{r.name}</p>
                    <p className="mt-1 text-xs text-muted">{r.industry}</p>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={r.plan}
                      disabled={saving === r.id}
                      onChange={(e) =>
                        update(r.id, { plan: e.target.value as Tenant["plan"] })
                      }
                      className="rounded-lg border border-line bg-ink px-2 py-1.5 text-xs"
                    >
                      <option value="STARTER">Starter</option>
                      <option value="BUSINESS">Business</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={r.status}
                      disabled={saving === r.id}
                      onChange={(e) =>
                        update(r.id, {
                          status: e.target.value as Tenant["status"],
                        })
                      }
                      className="rounded-lg border border-line bg-ink px-2 py-1.5 text-xs"
                    >
                      <option value="TRIAL">Trial</option>
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-white">{r._count.employees}</td>
                  <td className="px-5 py-4 text-white">{r._count.scans}</td>
                  <td className="px-5 py-4">
                    <Badge
                      tone={r._count.incidents > 20 ? "warning" : "neutral"}
                    >
                      {r._count.incidents}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/view-as/${r.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                    >
                      View as tenant <ArrowUpRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center">
          <Building2 className="mx-auto mb-3 text-accent" />
          <p className="font-semibold text-white">No tenants found</p>
          <p className="mt-2 text-sm text-muted">
            Try another search, or wait for a customer to create a workspace.
          </p>
        </div>
      )}
    </Card>
  );
}
