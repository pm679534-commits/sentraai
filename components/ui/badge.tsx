import { cn } from "@/lib/utils";
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warning" | "danger";
  className?: string;
}) {
  const colors = {
    neutral: "bg-white/5 text-muted border-line",
    good: "bg-accent/10 text-accent border-accent/20",
    warning: "bg-amber/10 text-amber border-amber/20",
    danger: "bg-danger/10 text-danger border-danger/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        colors[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
