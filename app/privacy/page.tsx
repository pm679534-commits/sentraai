import Link from "next/link";
import { Brand } from "@/components/brand";
import { t } from "@/lib/i18n";
export const metadata = { title: t.legal.privacy.title };
export default function Page() {
  return (
    <main className="min-h-screen bg-ink">
      <header className="border-b border-line px-6 py-5 sm:px-12">
        <Brand />
      </header>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">
          {t.legal.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-bold text-white">
          {t.legal.privacy.title}
        </h1>
        <p className="mt-6 text-base leading-8 text-muted">
          {t.legal.privacy.intro}
        </p>
        <h2 className="mt-10 text-xl font-semibold text-white">
          {t.legal.privacy.section}
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          {t.legal.privacy.body} {t.legal.privacy.contact}{" "}
          <a className="text-accent" href="mailto:privacy@sentraai.com">
            privacy@sentraai.com
          </a>
          .
        </p>
        <p className="mt-10 text-sm text-muted">{t.legal.privacy.note}</p>
        <Link
          href="/"
          className="mt-10 inline-block text-sm font-semibold text-accent"
        >
          ← {t.legal.back}
        </Link>
      </article>
    </main>
  );
}
