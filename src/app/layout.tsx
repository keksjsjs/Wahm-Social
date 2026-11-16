import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import { cookies } from "next/headers";
import { THEME_COOKIE, themeBootScript } from "@/lib/theme";
import { ALL_KEYWORDS } from "@/lib/seo/keywords";
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

const latin = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const arabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600", "700"], variable: "--font-ar", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: "Frostly — TikTok & Instagram Downloader, Viewer & Analytics | فروستلي", template: "%s" },
  description: DEFAULT_DESCRIPTION,
  applicationName: "Frostly",
  authors: [{ name: "Wahm", url: "https://x.com/iwahm" }],
  keywords: ALL_KEYWORDS,
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  category: "technology",
  openGraph: { siteName: "Frostly", type: "website", images: ["/api/og"] },
  twitter: { card: "summary_large_image", site: "@iwahm" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#070a16" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = getDict();
  const user = await currentUser();
  const theme = cookies().get(THEME_COOKIE)?.value;
  return (
    <html lang={locale} dir={dirFor(locale)} className={`${latin.variable} ${arabic.variable} ${theme === "dark" ? "dark" : ""}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
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
