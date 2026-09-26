import type { Metadata } from "next";
import "./globals.css";
import { t } from "@/lib/i18n";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "https://sentraai.com"),
  title: { default: t.seo.title, template: t.seo.template },
  description: t.seo.description,
  openGraph: {
    type: "website",
    title: t.seo.title,
    description: t.seo.openGraphDescription,
    siteName: "SentraAI",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
