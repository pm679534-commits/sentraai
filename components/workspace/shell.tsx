"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Activity,
  Bell,
  Building2,
  ChevronDown,
  FileText,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";
const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/incidents", label: "Incidents", icon: Activity },
  { href: "/policies", label: "Policy rules", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings2 },
];
export function WorkspaceShell({
  children,
  orgName,
  userName,
  role,
}: {
  children: React.ReactNode;
  orgName: string;
  userName: string;
  role: string;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-ink lg:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[255px] flex-col border-r border-line bg-[#0d202b] px-4 py-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-9 flex items-center justify-between px-2">
          <Brand />
          <button
            className="text-muted lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>
        <div className="mx-1 mb-8 flex items-center gap-3 rounded-xl border border-line bg-panel px-3 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Building2 size={18} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">
              {orgName}
            </p>
            <p className="mt-0.5 text-[11px] text-muted">
              Organization workspace
            </p>
          </div>
          <ChevronDown size={14} className="ml-auto shrink-0 text-muted" />
        </div>
        <p className="px-3 text-[10px] font-bold uppercase tracking-[.18em] text-muted/60">
          Workspace
        </p>
        <nav className="mt-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                path === href || path.startsWith(href + "/")
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-surface hover:text-white",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-accent/20 bg-accent/5 p-4">
          <div className="flex items-center gap-2 text-accent">
            <ShieldCheck size={18} />
            <span className="text-xs font-semibold">Protection active</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">
            Your rules are ready to inspect connected AI requests.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-line px-2 pt-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-sm font-bold text-white">
            {userName.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {userName}
            </p>
            <p className="text-[11px] capitalize text-muted">
              {role.toLowerCase()}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="focus-ring rounded-lg p-2 text-muted hover:bg-surface hover:text-white"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      {open && (
        <button
          className="fixed inset-0 z-30 bg-black/70 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        />
      )}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-line bg-ink/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="focus-ring rounded-lg p-2 text-muted lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>
            <span className="hidden text-xs font-semibold uppercase tracking-[.17em] text-muted sm:inline">
              Security command center
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs font-medium text-accent sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> All
              systems operational
            </span>
            <Link
              href="/incidents"
              className="focus-ring rounded-lg border border-line p-2.5 text-muted hover:text-white"
              aria-label="View incidents"
            >
              <Bell size={18} />
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
