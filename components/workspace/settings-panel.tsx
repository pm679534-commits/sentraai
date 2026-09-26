"use client";
import { useState, type FormEvent } from "react";
import {
  Copy,
  CreditCard,
  KeyRound,
  Plus,
  Settings2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
type Org = {
  id: string;
  name: string;
  industry: string;
  teamSize: string;
  plan: string;
  status: string;
};
type Key = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};
export function SettingsPanel({
  org,
  initialKeys,
  canManage,
}: {
  org: Org;
  initialKeys: Key[];
  canManage: boolean;
}) {
  const [tab, setTab] = useState<"profile" | "billing" | "keys">("profile");
  const [name, setName] = useState(org.name);
  const [industry, setIndustry] = useState(org.industry);
  const [teamSize, setTeamSize] = useState(org.teamSize);
  const [keys, setKeys] = useState(initialKeys);
  const [keyName, setKeyName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  function clear() {
    setError("");
    setNotice("");
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    clear();
    try {
      const r = await fetch("/api/organizations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, industry, teamSize }),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error?.message ?? "Could not save profile");
      setNotice("Organization profile saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  }
  async function createKey(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    clear();
    try {
      const r = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName }),
      });
      const b = await r.json();
      if (!r.ok)
        throw new Error(b.error?.message ?? "Could not create API key");
      setKeys([b.data, ...keys]);
      setNewKey(b.data.key);
      setKeyName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create API key");
    } finally {
      setBusy(false);
    }
  }
  async function revoke(id: string) {
    if (
      !window.confirm(
        "Revoke this API key? Connected gateways using it will stop working.",
      )
    )
      return;
    setBusy(true);
    clear();
    try {
      const r = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error?.message ?? "Could not revoke key");
      setKeys(
        keys.map((k) =>
          k.id === id ? { ...k, revokedAt: new Date().toISOString() } : k,
        ),
      );
      setNotice("API key revoked.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not revoke key");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <nav className="flex gap-2 lg:flex-col">
        {[
          { id: "profile", label: "Organization", icon: Settings2 },
          { id: "billing", label: "Plan & billing", icon: CreditCard },
          { id: "keys", label: "API keys", icon: KeyRound },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id as typeof tab);
                clear();
              }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${tab === item.id ? "bg-accent/10 text-accent" : "text-muted hover:bg-panel hover:text-white"}`}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="min-w-0">
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
        {tab === "profile" && (
          <Card className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white">
              Organization profile
            </h2>
            <p className="mt-1 text-sm text-muted">
              This information is visible to workspace administrators.
            </p>
            <form onSubmit={save} className="mt-7 max-w-xl space-y-5">
              <label className="block text-sm font-medium">
                Company name
                <Input
                  className="mt-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!canManage}
                  required
                />
              </label>
              <label className="block text-sm font-medium">
                Industry
                <Input
                  className="mt-2"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  disabled={!canManage}
                  required
                />
              </label>
              <label className="block text-sm font-medium">
                Team size
                <select
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  disabled={!canManage}
                  className="focus-ring mt-2 h-11 w-full rounded-lg border border-line bg-ink px-3.5 text-sm"
                >
                  <option>1-25</option>
                  <option>26-100</option>
                  <option>101-500</option>
                  <option>501-2000</option>
                  <option>2000+</option>
                </select>
              </label>
              <div className="flex items-center gap-3 pt-2">
                <Badge tone="good">{org.status.toLowerCase()}</Badge>
                {canManage && (
                  <Button disabled={busy}>
                    {busy ? "Saving…" : "Save changes"}
                  </Button>
                )}
              </div>
            </form>
          </Card>
        )}
        {tab === "billing" && (
          <Card className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white">Plan & billing</h2>
            <p className="mt-1 text-sm text-muted">
              Your current subscription and support level.
            </p>
            <div className="mt-7 rounded-xl border border-accent/25 bg-accent/5 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-accent">
                    Current plan
                  </p>
                  <h3 className="mt-2 text-2xl font-bold capitalize text-white">
                    {org.plan.toLowerCase()}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    Security controls for your growing AI program.
                  </p>
                </div>
                <ShieldCheck className="text-accent" />
              </div>
              <div className="mt-6 border-t border-line pt-5 text-xs text-muted">
                Billing is managed by the SentraAI team. Contact us for a plan
                change or invoice request.
              </div>
            </div>
            <Button asChild className="mt-6">
              <a href="mailto:billing@sentraai.com?subject=Manage%20SentraAI%20plan">
                Manage plan
              </a>
            </Button>
          </Card>
        )}
        {tab === "keys" && (
          <div className="space-y-5">
            <Card className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-white">
                Gateway API keys
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Keys authenticate scan requests from your gateway or future
                browser integration. Each key is shown only once.
              </p>
              {canManage ? (
                <form
                  onSubmit={createKey}
                  className="mt-6 flex flex-col gap-3 sm:flex-row"
                >
                  <Input
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="Key name, e.g. Production gateway"
                    required
                  />
                  <Button disabled={busy} className="shrink-0">
                    <Plus size={16} /> Generate key
                  </Button>
                </form>
              ) : (
                <p className="mt-5 text-sm text-muted">
                  Only owners and admins can manage API keys.
                </p>
              )}
              {newKey && (
                <div className="mt-5 rounded-xl border border-amber/30 bg-amber/10 p-4">
                  <p className="text-sm font-semibold text-amber">
                    Copy this key now. It will not be shown again.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <code className="min-w-0 flex-1 break-all rounded-lg bg-ink p-3 text-xs text-white">
                      {newKey}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(newKey)}
                      aria-label="Copy key"
                      className="rounded-lg bg-ink p-3 text-accent"
                    >
                      <Copy size={17} />
                    </button>
                  </div>
                  <button
                    onClick={() => setNewKey("")}
                    className="mt-3 text-xs font-semibold text-amber hover:underline"
                  >
                    I have saved this key
                  </button>
                </div>
              )}
            </Card>
            <Card className="overflow-hidden">
              <div className="border-b border-line px-6 py-5">
                <h3 className="font-semibold text-white">Issued keys</h3>
              </div>
              {keys.length ? (
                <div className="divide-y divide-line">
                  {keys.map((k) => (
                    <div
                      key={k.id}
                      className="flex flex-wrap items-center gap-4 px-6 py-4"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-accent">
                        <KeyRound size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">
                          {k.name}{" "}
                          <Badge
                            tone={k.revokedAt ? "neutral" : "good"}
                            className="ml-1"
                          >
                            {k.revokedAt ? "Revoked" : "Active"}
                          </Badge>
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {k.prefix}•••• · Created {formatDate(k.createdAt)} ·
                          Last used{" "}
                          {k.lastUsedAt ? formatDate(k.lastUsedAt) : "Never"}
                        </p>
                      </div>
                      {!k.revokedAt && canManage && (
                        <button
                          disabled={busy}
                          onClick={() => revoke(k.id)}
                          className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger"
                          title="Revoke key"
                          aria-label={`Revoke ${k.name}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <KeyRound className="mx-auto mb-3 text-accent" />
                  <p className="font-semibold text-white">No API keys yet</p>
                  <p className="mt-2 text-sm text-muted">
                    Generate a key to connect a gateway.
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
