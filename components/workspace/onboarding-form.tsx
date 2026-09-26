"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, Check } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("Financial services");
  const [teamSize, setTeamSize] = useState("101-500");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, industry, teamSize }),
      });
      const body = await r.json();
      if (!r.ok)
        throw new Error(body.error?.message ?? "Could not create workspace");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-line px-6 py-5 sm:px-12">
        <Brand />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-14">
        <div className="mb-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-accent">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-ink">
            1
          </span>{" "}
          Workspace setup <span className="h-px flex-1 bg-line" />{" "}
          <span className="text-muted">2 · Dashboard</span>
        </div>
        <div className="rounded-2xl border border-line bg-panel p-7 sm:p-10">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
            <Building2 />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Tell us about your organization
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            We’ll create your private workspace and start with sensible
            protection policies. You can tune them at any time.
          </p>
          <form onSubmit={submit} className="mt-9 space-y-5">
            <label className="block text-sm font-medium">
              Company name
              <Input
                className="mt-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your company"
                required
              />
            </label>
            <label className="block text-sm font-medium">
              Industry
              <select
                className="focus-ring mt-2 h-11 w-full rounded-lg border border-line bg-ink/60 px-3.5 text-sm"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                {[
                  "Financial services",
                  "Insurance",
                  "Fintech",
                  "E-commerce",
                  "Technology",
                  "Other",
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Team size
              <select
                className="focus-ring mt-2 h-11 w-full rounded-lg border border-line bg-ink/60 px-3.5 text-sm"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
              >
                {["1-25", "26-100", "101-500", "501-2000", "2000+"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-danger/10 p-3 text-sm text-danger"
              >
                {error}
              </p>
            )}
            <Button className="w-full" disabled={busy}>
              {busy ? "Creating workspace…" : "Create workspace"}
              <ArrowRight size={16} />
            </Button>
          </form>
        </div>
        <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-accent" /> Private tenant workspace
          </span>
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-accent" /> Starter policies
            included
          </span>
        </div>
      </main>
    </div>
  );
}
