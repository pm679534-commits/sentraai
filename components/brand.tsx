import Link from "next/link";
import { ShieldCheck } from "lucide-react";
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="focus-ring inline-flex items-center gap-2.5 text-white"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
        <ShieldCheck size={21} strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="text-xl font-bold tracking-tight">
          Sentra<span className="text-accent">AI</span>
        </span>
      )}
    </Link>
  );
}
