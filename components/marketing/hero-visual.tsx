import {
  ArrowRight,
  Check,
  LockKeyhole,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { t } from "@/lib/i18n";
export function HeroVisual() {
  return (
    <div className="hero-visual-enter relative mx-auto w-full max-w-[560px]">
      <div className="absolute -inset-10 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-line bg-[#102330] shadow-glow">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_#41d5b0]" />
            <span className="text-xs font-semibold tracking-[.16em] text-muted">
              {t.visual.inspection}
            </span>
          </div>
          <span className="text-xs text-muted">{t.visual.gateway}</span>
        </div>
        <div className="p-5 sm:p-7">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-muted">
              {t.visual.outgoing}{" "}
              <ArrowRight className="mx-1 inline" size={13} /> {t.visual.tool}
            </span>
            <span className="rounded-full border border-amber/25 bg-amber/10 px-2.5 py-1 text-xs font-medium text-amber">
              {t.visual.review}
            </span>
          </div>
          <div className="rounded-xl border border-line bg-ink/70 p-4 font-mono text-[12px] leading-6 text-[#b5cbd0] sm:text-sm">
            {t.visual.promptStart}{" "}
            <span className="rounded bg-danger/15 px-1 text-danger">
              {t.visual.email}
            </span>{" "}
            {t.visual.promptMiddle}{" "}
            <span className="rounded bg-danger/15 px-1 text-danger">
              {t.visual.amount}
            </span>
            .
          </div>
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-accent">
              <Sparkles size={12} /> {t.visual.engine}
            </span>
            <div className="h-px flex-1 bg-line" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line bg-surface/60 p-3">
              <div className="mb-2 flex items-center gap-2 text-amber">
                <ShieldAlert size={16} />
                <span className="text-xs font-semibold">
                  {t.visual.findings}
                </span>
              </div>
              <p className="text-xs text-muted">{t.visual.findingTypes}</p>
            </div>
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
              <div className="mb-2 flex items-center gap-2 text-accent">
                <LockKeyhole size={16} />
                <span className="text-xs font-semibold">
                  {t.visual.applied}
                </span>
              </div>
              <p className="text-xs text-muted">{t.visual.masked}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-accent/25 bg-accent/10 px-3 py-3 text-xs text-[#c5eee1]">
            <Check size={15} className="shrink-0 text-accent" />{" "}
            {t.visual.ready}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-line bg-panel px-4 py-3 shadow-2xl sm:block">
        <span className="text-[11px] uppercase tracking-wider text-muted">
          {t.visual.protected}
        </span>
        <div className="mt-1 text-xl font-bold text-white">
          {t.visual.count}{" "}
          <span className="ml-1 text-xs font-normal text-accent">
            {t.visual.change}
          </span>
        </div>
      </div>
    </div>
  );
}
