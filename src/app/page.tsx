import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { SearchBox } from "@/components/search/SearchBox";
import { FeatureGrid } from "@/components/content/FeatureGrid";
import { Faq } from "@/components/content/Faq";
import { FAQ } from "@/lib/content/faq";
import { FEATURED } from "@/lib/content/featured";
import { ARTICLES } from "@/lib/content/blog";
import { Searches } from "@/lib/server/db";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, jsonLdFaq, jsonLdSoftware } from "@/lib/seo";
import { Badge, PlatformIcon, ProBadge } from "@/components/ui";
import { PricingTable } from "@/components/pricing/PricingTable";
import { currentUser } from "@/lib/server/auth";
import { billingMode } from "@/lib/env";

export const metadata = buildMetadata({
  title: "وهم سوشال — عرض حسابات تيك توك وانستقرام وتحميل بدون علامة مائية | Wahm Social",
  path: "/",
});

export const dynamic = "force-dynamic";

export default async function Home() {
  const { locale, t } = getDict();
  const trending = Searches.trending(10);
  const user = await currentUser();
  const faq = FAQ[locale];
  return (
    <>
      <JsonLd data={[jsonLdSoftware(), jsonLdFaq(faq)]} />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
        <div className="container-w relative pb-16 pt-16 text-center sm:pt-24">
          <div className="mb-6 flex justify-center">
            <Badge tone="gold">✦ {t.hero.badge}</Badge>
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-black leading-tight text-white sm:text-6xl">
            {t.hero.title1} <span className="gold-text">{t.hero.title2}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">{t.hero.subtitle}</p>
          <div className="mt-10">
            <SearchBox />
          </div>
          {trending.length > 0 && (
            <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
              <span className="text-xs text-slate-500">{t.search.trending}:</span>
              {trending.map((s) => (
                <Link key={s.platform + s.username} href={`/${s.platform}/${s.username}`} className="chip hover:border-gold-500/40">
                  <PlatformIcon platform={s.platform} className="h-3 w-3" />@{s.username}
                </Link>
              ))}
            </div>
          )}
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-4">
            {[
              ["2.4M+", t.hero.statAccounts],
              ["18M+", t.hero.statDownloads],
              ["99.9%", t.hero.statUptime],
            ].map(([v, l]) => (
              <div key={l} className="card px-3 py-4">
                <div className="gold-text text-2xl font-black sm:text-3xl">{v}</div>
                <div className="mt-1 text-xs text-slate-400">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-w py-12">
        <h2 className="section-title mb-8 text-center">{t.features.title}</h2>
        <FeatureGrid t={t} />
      </section>

      <section className="container-w py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="section-title">{t.nav.explore}</h2>
          <Link href="/explore" className="text-sm text-gold-300 hover:underline">
            {locale === "ar" ? "عرض الكل ←" : "View all →"}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FEATURED.slice(0, 8).map((f) => (
            <Link key={f.platform + f.username} href={`/${f.platform}/${f.username}`} className="card card-hover flex items-center gap-3 p-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-navy-700 text-gold-300">
                <PlatformIcon platform={f.platform} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-white">{f.name}</div>
                <div className="truncate text-xs text-slate-400" dir="ltr">
                  @{f.username}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-w py-12">
        <div className="card grid items-center gap-8 overflow-hidden p-8 md:grid-cols-2 md:p-12">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <ProBadge /> <span className="text-sm text-gold-300">Wahm Pro</span>
            </div>
            <h2 className="text-3xl font-black text-white">{t.pro.lockedDesc}</h2>
            <ul className="mt-6 space-y-2 text-slate-300">
              {[t.features.batch[0], t.features.compare[0], t.features.watchlist[0], t.analytics.title, "CSV"].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <span className="text-gold-400">✓</span> {x}
                </li>
              ))}
            </ul>
            <Link href="/pricing" className="btn-gold mt-8">
              {t.pro.upgrade}
            </Link>
          </div>
          <div className="relative hidden h-64 md:block">
            <div className="absolute inset-0 animate-floaty rounded-3xl border border-gold-500/30 bg-gradient-to-br from-navy-700 to-navy-900 p-6 shadow-gold">
              <div className="text-sm text-slate-400">{t.analytics.engagement}</div>
              <div className="gold-text text-5xl font-black">6.8%</div>
              <svg viewBox="0 0 300 100" className="mt-6 h-24 w-full">
                <polyline fill="none" stroke="#d4a944" strokeWidth="3" points="0,80 40,70 80,74 120,50 160,56 200,30 240,36 300,10" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="container-w py-12">
        <h2 className="section-title mb-8 text-center">{t.nav.pricing}</h2>
        <PricingTable currentPlan={user?.plan ?? null} mock={billingMode() === "mock"} />
      </section>

      <section className="container-w py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="section-title">{t.nav.blog}</h2>
          <Link href="/blog" className="text-sm text-gold-300 hover:underline">
            {locale === "ar" ? "كل المقالات ←" : "All articles →"}
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {ARTICLES.slice(0, 3).map((a) => (
            <Link key={a.slug} href={`/blog/${a.slug}`} className="card card-hover p-6">
              <div className="text-xs text-gold-400">{a.date}</div>
              <h3 className="mt-2 font-bold leading-7 text-white">{a.title[locale]}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">{a.excerpt[locale]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-w py-12">
        <h2 className="section-title mb-8 text-center">{t.pricing.faq}</h2>
        <Faq items={faq} />
      </section>
    </>
  );
}
