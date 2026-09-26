"use client";
import { useEffect, useState } from "react";
import { Building2, Eye, LockKeyhole, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
type Tenant = {
  id: string;
  name: string;
  plan: string;
  status: string;
  _count: { employees: number; incidents: number; users: number };
};
export function TenantPreview({ id }: { id: string }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/view-as/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      signal: controller.signal,
    })
      .then(async (r) => {
        const b = await r.json();
        if (!r.ok)
          throw new Error(b.error?.message ?? "Tenant could not be loaded");
        setTenant(b.data);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => controller.abort();
  }, [id]);
  if (error)
    return (
      <div
        role="alert"
        className="rounded-xl border border-danger/20 bg-danger/10 p-6 text-sm text-danger"
      >
        {error}
      </div>
    );
  if (!tenant)
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-64 rounded bg-surface" />
        <div className="h-40 rounded-xl bg-panel" />
      </div>
    );
  return (
    <>
      <div className="mb-7 flex items-center gap-2 rounded-xl border border-amber/30 bg-amber/10 p-4 text-sm font-semibold text-amber">
        <Eye size={18} /> Read-only tenant view · This access was recorded in
        the admin audit log.
      </div>
      <div className="mb-7 flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Building2 size={26} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            Tenant preview
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">{tenant.name}</h1>
          <div className="mt-3 flex gap-2">
            <Badge tone="good">{tenant.status.toLowerCase()}</Badge>
            <Badge>{tenant.plan.toLowerCase()}</Badge>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Workspace users", tenant._count.users],
          ["Monitored employees", tenant._count.employees],
          ["Flagged incidents", tenant._count.incidents],
        ].map(([label, value]) => (
          <Card key={label} className="p-6">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-3 text-3xl font-bold text-white">{value}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-5 p-7">
        <div className="flex items-center gap-2 text-accent">
          <LockKeyhole size={19} />
          <h2 className="font-semibold">Access boundary</h2>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          This view shows only tenant metadata. It does not create a customer
          session or grant access to customer actions. To change a plan or
          status, return to Tenant management; that action is audited
          separately.
        </p>
      </Card>
    </>
  );
}
