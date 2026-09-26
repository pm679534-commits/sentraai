"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Activity,
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Brand } from "@/components/brand";
const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/tenants", label: "Tenants", icon: Building2 },
  { href: "/admin/incidents", label: "Global incidents", icon: Activity },
  { href: "/admin/audit", label: "Audit log", icon: ClipboardList },
];
export function AdminShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const path = usePathname();
  return (
    <div className="min-h-screen bg-ink lg:flex">
      <aside className="border-b border-line bg-[#0d202b] p-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[245px] lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <Brand />
        <div className="mt-5 rounded-lg border border-amber/25 bg-amber/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-amber">
          Internal operations
        </div>
        <nav className="mt-7 flex flex-wrap gap-1 lg:flex-col">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${path === href ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface hover:text-white"}`}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-5 flex items-center gap-3 border-t border-line pt-4 lg:mt-auto">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-sm font-bold">
            {userName[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {userName}
            </p>
            <p className="text-[11px] text-muted">Internal admin</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="Sign out"
            className="text-muted hover:text-white"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-[72px] items-center justify-between border-b border-line px-5 sm:px-8">
          <span className="text-xs font-semibold uppercase tracking-[.17em] text-muted">
            SentraAI operations
          </span>
          <span className="flex items-center gap-2 text-xs text-accent">
            <ShieldCheck size={15} /> Admin session
          </span>
        </header>
        <main className="mx-auto max-w-[1450px] px-5 py-9 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
