"use client";
import { useState } from "react";
import {
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CATEGORIES, type Category } from "@/lib/detection-engine";
type Rule = {
  id: string;
  category: string;
  action: "MASK" | "BLOCK" | "ALERT";
  enabled: boolean;
  updatedAt: string;
  organizationId: string;
};
const descriptions: Record<Category, string> = {
  CARD: "Payment card numbers validated with a checksum",
  AZ_FIN: "Azerbaijani personal identification codes",
  EMAIL: "Personal and business email addresses",
  PHONE: "Azerbaijani mobile numbers",
  SECRET: "API keys, tokens, credentials, and passwords",
  IBAN: "Azerbaijani bank account numbers",
  FINANCIAL: "Revenue, profit, budget, and forecast figures",
  CONFIDENTIAL: "Confidential agreements and contract language",
};
const names: Record<Category, string> = {
  CARD: "Payment cards",
  AZ_FIN: "National ID / FIN",
  EMAIL: "Email addresses",
  PHONE: "Phone numbers",
  SECRET: "Secrets & credentials",
  IBAN: "Bank account / IBAN",
  FINANCIAL: "Financial figures",
  CONFIDENTIAL: "Confidential clauses",
};
export function PolicyEditor({
  initial,
  canManage,
}: {
  initial: Rule[];
  canManage: boolean;
}) {
  const [rows, setRows] = useState(initial);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function change(
    category: Category,
    update: Partial<Pick<Rule, "enabled" | "action">>,
  ) {
    const row = rows.find((r) => r.category === category);
    setSaving(category);
    setError("");
    setNotice("");
    try {
      const r = await fetch(
        row ? `/api/policy-rules/${row.id}` : "/api/policy-rules",
        {
          method: row ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            row
              ? update
              : {
                  category,
                  enabled: update.enabled ?? true,
                  action: update.action ?? "MASK",
                },
          ),
        },
      );
      const body = await r.json();
      if (!r.ok) throw new Error(body.error?.message ?? "Could not save rule");
      setRows(
        row
          ? rows.map((x) => (x.id === row.id ? body.data : x))
          : [...rows, body.data],
      );
      setNotice(`${names[category]} policy saved.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save rule");
    } finally {
      setSaving("");
    }
  }
  return (
    <>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            label: "Active rules",
            value: rows.filter((r) => r.enabled).length,
          },
          {
            icon: LockKeyhole,
            label: "Block policies",
            value: rows.filter((r) => r.enabled && r.action === "BLOCK").length,
          },
          {
            icon: Fingerprint,
            label: "Detection categories",
            value: CATEGORIES.length,
          },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{m.value}</p>
                <p className="text-xs text-muted">{m.label}</p>
              </div>
            </Card>
          );
        })}
      </div>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm text-danger"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-accent/20 bg-accent/10 p-3 text-sm text-accent"
        >
          {notice}
        </p>
      )}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line p-6">
          <SlidersHorizontal size={20} className="text-accent" />
          <div>
            <h2 className="font-semibold text-white">Detection categories</h2>
            <p className="mt-1 text-xs text-muted">
              Changes apply to the next scan request.
            </p>
          </div>
        </div>
        <div className="divide-y divide-line">
          {CATEGORIES.map((category) => {
            const row = rows.find((r) => r.category === category);
            const enabled = row?.enabled ?? false;
            return (
              <div
                key={category}
                className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center"
              >
                <button
                  type="button"
                  disabled={!canManage || saving === category}
                  onClick={() => change(category, { enabled: !enabled })}
                  aria-label={`${enabled ? "Disable" : "Enable"} ${names[category]}`}
                  aria-pressed={enabled}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${enabled ? "bg-accent" : "bg-surface"}`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${enabled ? "left-6" : "left-1"}`}
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">
                      {names[category]}
                    </h3>
                    {!enabled && <Badge>Off</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {descriptions[category]}
                  </p>
                </div>
                <select
                  aria-label={`Action for ${names[category]}`}
                  disabled={!canManage || !enabled || saving === category}
                  value={row?.action ?? "MASK"}
                  onChange={(e) =>
                    change(category, {
                      action: e.target.value as Rule["action"],
                    })
                  }
                  className="focus-ring h-10 min-w-[170px] rounded-lg border border-line bg-ink px-3 text-sm text-white disabled:opacity-50"
                >
                  <option value="MASK">Mask sensitive data</option>
                  <option value="BLOCK">Block request</option>
                  <option value="ALERT">Alert only</option>
                </select>
              </div>
            );
          })}
        </div>
      </Card>
      <div className="mt-5 rounded-xl border border-line bg-panel/50 p-5">
        <p className="text-sm font-semibold text-white">
          How policy actions work
        </p>
        <p className="mt-2 text-xs leading-6 text-muted">
          <strong className="text-accent">Mask</strong> replaces detected spans.{" "}
          <strong className="text-danger">Block</strong> marks the request for
          rejection by the gateway.{" "}
          <strong className="text-amber">Alert only</strong> records an incident
          while allowing the request. The gateway must honor the returned
          action.
        </p>
      </div>
    </>
  );
}
