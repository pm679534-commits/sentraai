"use client";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
type Mode = "login" | "signup" | "forgot" | "reset";
export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const search = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const titles = {
    login: "Welcome back",
    signup: "Create your workspace",
    forgot: "Reset your password",
    reset: "Choose a new password",
  };
  const subtitles = {
    login: "Sign in to your security command center.",
    signup: "Start protecting your team’s AI workflows.",
    forgot: "We’ll send a secure reset link to your email.",
    reset: "Use a strong password with at least 12 characters.",
  };
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      if (mode === "login") {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (result?.error)
          throw new Error("Invalid email or password, or account unavailable.");
        router.replace("/auth/continue");
        router.refresh();
      } else if (mode === "signup") {
        const result = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const body = await result.json();
        if (!result.ok)
          throw new Error(body.error?.message ?? "Could not create account");
        const login = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (login?.error) throw new Error("Account created. Please sign in.");
        router.push("/onboarding");
        router.refresh();
      } else if (mode === "forgot") {
        const result = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const body = await result.json();
        if (!result.ok)
          throw new Error(body.error?.message ?? "Could not send reset email");
        setSuccess(body.data.message);
      } else {
        const token = search.get("token") ?? "";
        const result = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });
        const body = await result.json();
        if (!result.ok)
          throw new Error(body.error?.message ?? "Could not reset password");
        setSuccess("Password updated. You can now sign in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-screen bg-ink lg:grid lg:grid-cols-2">
      <div className="flex min-h-screen flex-col px-6 py-7 sm:px-12 lg:px-16">
        <Brand />
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
            <LockKeyhole size={23} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {titles[mode]}
          </h1>
          <p className="mt-2 text-sm text-muted">{subtitles[mode]}</p>
          <form onSubmit={submit} className="mt-9 space-y-5">
            {mode === "signup" && (
              <label className="block text-sm font-medium text-[#d5e1e1]">
                Full name
                <Input
                  className="mt-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Leyla Mammadova"
                  autoComplete="name"
                  required
                />
              </label>
            )}
            {mode !== "reset" && (
              <label className="block text-sm font-medium text-[#d5e1e1]">
                Work email
                <Input
                  className="mt-2"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </label>
            )}
            {mode !== "forgot" && (
              <label className="block text-sm font-medium text-[#d5e1e1]">
                Password
                <div className="relative mt-2">
                  <Input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === "signup" || mode === "reset"
                        ? "At least 12 characters"
                        : "Enter your password"
                    }
                    minLength={mode === "login" ? undefined : 12}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-3 text-muted hover:text-white"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>
            )}
            {mode === "login" && (
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
              >
                {error}
              </div>
            )}
            {success && (
              <div
                role="status"
                className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent"
              >
                {success}
              </div>
            )}
            <Button className="w-full" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : mode === "signup"
                    ? "Create account"
                    : mode === "forgot"
                      ? "Send reset link"
                      : "Update password"}
              <ArrowRight size={16} />
            </Button>
          </form>
          <p className="mt-7 text-center text-sm text-muted">
            {mode === "login" ? (
              <>
                New to SentraAI?{" "}
                <Link
                  className="font-semibold text-accent hover:underline"
                  href="/signup"
                >
                  Create an account
                </Link>
              </>
            ) : (
              <Link
                className="font-semibold text-accent hover:underline"
                href="/login"
              >
                Back to sign in
              </Link>
            )}
          </p>
        </div>
        <p className="text-xs text-muted/70">
          © {new Date().getFullYear()} SentraAI · Enterprise AI security
        </p>
      </div>
      <div className="relative hidden overflow-hidden border-l border-line bg-[#102530] p-12 lg:flex lg:flex-col lg:justify-center">
        <div className="absolute inset-0 grid-line opacity-50" />
        <div className="absolute -right-40 top-20 h-[550px] w-[550px] rounded-full bg-accent/10 blur-[100px]" />
        <div className="relative mx-auto max-w-lg">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Your AI
            perimeter, under control
          </div>
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-white">
            Adopt AI with confidence.
            <br />
            <span className="text-accent">Protect what matters.</span>
          </h2>
          <p className="mt-5 text-base leading-7 text-muted">
            See sensitive data before it leaves, apply the right policy
            automatically, and give every team a safer way to work.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              ["24/7", "Visibility"],
              ["100%", "Policy control"],
              ["0", "Raw prompts stored"],
            ].map(([a, b]) => (
              <div
                key={a}
                className="rounded-xl border border-line bg-panel/70 p-4"
              >
                <p className="text-xl font-bold text-white">{a}</p>
                <p className="mt-1 text-xs text-muted">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
