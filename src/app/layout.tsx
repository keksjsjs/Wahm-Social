import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { getDict } from "@/lib/i18n/server";
import { dirFor } from "@/lib/i18n";
import { I18nProvider } from "@/components/I18nProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { currentUser, publicUser } from "@/lib/server/auth";
import { env } from "@/lib/env";
import { DEFAULT_DESCRIPTION, jsonLdOrganization, jsonLdWebsite } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

const font = Tajawal({ subsets: ["arabic", "latin"], weight: ["400", "500", "700", "800", "900"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: "وهم سوشال | Wahm Social — عارض وتحميل تيك توك وانستقرام", template: "%s" },
  description: DEFAULT_DESCRIPTION,
  applicationName: "Wahm Social",
  authors: [{ name: "Wahm", url: "https://x.com/iwahm" }],
  keywords: [
    "تحميل تيك توك",
    "تحميل فيديو تيك توك بدون علامة مائية",
    "عرض حساب انستقرام",
    "ستوري انستقرام",
    "تحليل حساب تيك توك",
    "TikTok downloader",
    "Instagram viewer",
    "TikTok analytics",
    "Instagram story viewer",
    "Wahm",
  ],
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  openGraph: { siteName: "Wahm Social", type: "website", images: ["/api/og"] },
  twitter: { card: "summary_large_image", site: "@iwahm" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#050a18", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = getDict();
  const user = await currentUser();
  return (
    <html lang={locale} dir={dirFor(locale)} className={font.variable}>
      <body className="font-sans">
        <JsonLd data={[jsonLdWebsite(), jsonLdOrganization()]} />
        <I18nProvider locale={locale} t={t}>
          <Header t={t} user={user ? publicUser(user) : null} />
          <main className="min-h-[60vh]">{children}</main>
          <Footer t={t} />
        </I18nProvider>
      </body>
    </html>
  );
}
