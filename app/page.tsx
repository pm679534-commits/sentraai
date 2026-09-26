import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronRight,
  CircleDot,
  DatabaseZap,
  Fingerprint,
  LockKeyhole,
  Menu,
  ScanSearch,
  Shield,
  ShieldCheck,
  ShieldX,
  SlidersHorizontal,
  Workflow,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { t } from "@/lib/i18n";
const featureIcons = [
  ScanSearch,
  Fingerprint,
  SlidersHorizontal,
  DatabaseZap,
  BarChart3,
  ShieldCheck,
];
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-accent">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </p>
  );
}
function Heading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-2xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[44px]">
        {title}
      </h2>
      {body && <p className="mt-5 text-base leading-7 text-muted">{body}</p>}
    </div>
  );
}
export default function Home() {
  return (
    <main className="overflow-hidden">
      <div className="relative border-b border-line/70 bg-ink">
        <div className="absolute inset-0 grid-line opacity-60" />
        <div className="absolute left-[35%] top-0 h-[650px] w-[650px] rounded-full bg-accent/[.07] blur-[120px]" />
        <header className="relative z-10 mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Brand />
          <nav className="hidden items-center gap-8 text-sm text-[#b5c6cb] lg:flex">
            <Link className="hover:text-white" href="#platform">
              {t.nav.platform}
            </Link>
            <Link className="hover:text-white" href="#how">
              {t.nav.how}
            </Link>
            <Link className="hover:text-white" href="#trust">
              {t.nav.trust}
            </Link>
            <Link className="hover:text-white" href="#pricing">
              {t.nav.pricing}
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              className="hidden text-sm font-medium text-muted hover:text-white sm:block"
              href="/login"
            >
              {t.nav.login}
            </Link>
            <Button asChild size="sm">
              <a href="mailto:hello@sentraai.com?subject=SentraAI%20demo">
                {t.nav.demo}
                <ArrowUpRight size={15} />
              </a>
            </Button>
          </div>
        </header>
        <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-5 pb-28 pt-20 sm:px-8 lg:grid-cols-[1.04fr_.96fr] lg:pb-40 lg:pt-28">
          <div>
            <Eyebrow>{t.hero.eyebrow}</Eyebrow>
            <h1 className="max-w-[640px] text-[46px] font-bold leading-[1.08] tracking-[-.045em] text-white sm:text-[62px] lg:text-[68px]">
              {t.hero.titleA}
              <br />
              <span className="text-accent">{t.hero.titleB}</span>
            </h1>
            <p className="mt-7 max-w-[575px] text-[17px] leading-8 text-[#a7bcc4]">
              {t.hero.body}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/signup">
                  {t.hero.primary}
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="mailto:hello@sentraai.com?subject=SentraAI%20sales">
                  {t.hero.secondary}
                </a>
              </Button>
            </div>
            <div className="mt-12 flex items-center gap-3 border-t border-line/70 pt-6 text-sm text-muted">
              <ShieldCheck size={18} className="shrink-0 text-accent" />
              {t.hero.proof}
            </div>
          </div>
          <HeroVisual />
        </section>
      </div>
      <section className="border-b border-line/70 bg-[#0d1e29] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Heading
            eyebrow={t.problem.eyebrow}
            title={t.problem.title}
            body={t.problem.body}
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {t.problem.cards.map((card, i) => (
              <div
                key={card.title}
                className="rounded-2xl border border-line bg-panel/70 p-7"
              >
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-danger/20 bg-danger/10 text-danger">
                  {[ShieldX, CircleDot, Workflow].map((Icon, j) =>
                    i === j ? <Icon key={j} size={21} /> : null,
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="how" className="border-b border-line/70 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Heading eyebrow={t.how.eyebrow} title={t.how.title} />
          <div className="relative mt-14 grid gap-5 md:grid-cols-4">
            <div className="absolute left-5 right-5 top-[26px] hidden h-px bg-line md:block" />
            {t.how.steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="mb-7 flex h-[52px] w-[52px] items-center justify-center rounded-full border border-accent/30 bg-[#0d292f] text-sm font-bold text-accent shadow-[0_0_0_7px_#091722]">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-muted">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        id="platform"
        className="border-b border-line/70 bg-[#0d1e29] py-24 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Heading eyebrow={t.features.eyebrow} title={t.features.title} />
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {t.features.items.map((item, i) => {
              const Icon = featureIcons[i];
              return (
                <div
                  key={item.title}
                  className="bg-panel p-8 transition-colors hover:bg-surface"
                >
                  <Icon size={25} className="text-accent" />
                  <h3 className="mt-7 text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section id="trust" className="border-b border-line/70 py-24 sm:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
          <div>
            <Heading
              eyebrow={t.trust.eyebrow}
              title={t.trust.title}
              body={t.trust.body}
            />
            <div className="mt-8 flex flex-wrap gap-2">
              {t.trust.badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-line bg-panel px-3.5 py-2 text-xs font-medium text-[#bdced1]"
                >
                  <Check size={13} className="mr-1.5 inline text-accent" />
                  {b}
                </span>
              ))}
            </div>
          </div>
          <div className="relative rounded-2xl border border-line bg-panel p-7 shadow-glow">
            <div className="flex items-center justify-between border-b border-line pb-5">
              <span className="font-semibold text-white">
                {t.trust.boundary}
              </span>
              <Shield size={19} className="text-accent" />
            </div>
            <div className="mt-6 space-y-4">
              {t.trust.flow.map((row) => (
                <div
                  key={row.number}
                  className="flex gap-4 rounded-xl border border-line bg-ink/60 p-4"
                >
                  <span className="font-mono text-sm text-accent">
                    {row.number}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {row.title}
                    </p>
                    <p className="mt-1 text-xs text-muted">{row.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-3 text-xs font-semibold text-accent">
              <LockKeyhole size={15} /> {t.trust.storageNote}
            </div>
          </div>
        </div>
      </section>
      <section
        id="pricing"
        className="border-b border-line/70 bg-[#0d1e29] py-24 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Heading eyebrow={t.pricing.eyebrow} title={t.pricing.title} />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {t.pricing.plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-2xl border p-7 ${i === 1 ? "border-accent/60 bg-[#123139] shadow-glow" : "border-line bg-panel"}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    {plan.name}
                  </h3>
                  {i === 1 && (
                    <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">
                      {t.pricing.popular}
                    </span>
                  )}
                </div>
                <div className="mt-6 text-4xl font-bold text-white">
                  {plan.price}
                  <span className="text-sm font-normal text-muted">
                    {" "}
                    {plan.suffix}
                  </span>
                </div>
                <p className="mt-3 min-h-12 text-sm leading-6 text-muted">
                  {plan.body}
                </p>
                <div className="my-7 h-px bg-line" />
                <ul className="flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm text-[#c4d2d4]">
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-accent"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={i === 1 ? "default" : "outline"}
                  className="mt-9 w-full"
                >
                  {i === 2 ? (
                    <a href="mailto:hello@sentraai.com?subject=Enterprise%20plan">
                      {plan.cta}
                      <ArrowRight size={16} />
                    </a>
                  ) : (
                    <Link href="/signup">
                      {plan.cta}
                      <ArrowRight size={16} />
                    </Link>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Heading
            eyebrow={t.testimonials.eyebrow}
            title={t.testimonials.title}
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {t.testimonials.quotes.map((q) => (
              <blockquote
                key={q.company}
                className="rounded-2xl border border-line bg-panel p-8"
              >
                <div className="mb-6 text-3xl leading-none text-accent">“</div>
                <p className="text-lg leading-8 text-white">{q.quote}</p>
                <footer className="mt-8 border-t border-line pt-5">
                  <p className="text-sm font-semibold text-white">{q.person}</p>
                  <p className="mt-1 text-xs text-muted">{q.company}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
      <section className="px-5 pb-20 sm:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-accent/25 bg-[#123139] px-7 py-14 sm:px-14 sm:py-16">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <Eyebrow>{t.cta.eyebrow}</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              {t.cta.title}
            </h2>
            <p className="mt-5 text-base leading-7 text-[#b9d0d1]">
              {t.cta.body}
            </p>
            <Button asChild size="lg" className="mt-8">
              <a href="mailto:hello@sentraai.com?subject=SentraAI%20walkthrough">
                {t.cta.action}
                <ArrowRight size={17} />
              </a>
            </Button>
          </div>
        </div>
      </section>
      <footer className="border-t border-line bg-[#0c1b25] px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 sm:flex-row">
          <div>
            <Brand />
            <p className="mt-4 text-sm text-muted">{t.footer.line}</p>
            <p className="mt-5 text-xs text-muted/70">
              © {new Date().getFullYear()} SentraAI. {t.footer.rights}
            </p>
          </div>
          <div className="flex gap-12 text-sm">
            <div>
              <p className="mb-4 font-semibold text-white">
                {t.footer.product}
              </p>
              <div className="space-y-3 text-muted">
                <Link className="block hover:text-white" href="#platform">
                  {t.footer.links.platform}
                </Link>
                <Link className="block hover:text-white" href="#pricing">
                  {t.footer.links.pricing}
                </Link>
                <Link className="block hover:text-white" href="/login">
                  {t.footer.links.signIn}
                </Link>
              </div>
            </div>
            <div>
              <p className="mb-4 font-semibold text-white">
                {t.footer.company}
              </p>
              <div className="space-y-3 text-muted">
                <a
                  className="block hover:text-white"
                  href="mailto:hello@sentraai.com"
                >
                  {t.footer.contact}
                </a>
                <Link className="block hover:text-white" href="/privacy">
                  {t.footer.privacy}
                </Link>
                <Link className="block hover:text-white" href="/terms">
                  {t.footer.terms}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
