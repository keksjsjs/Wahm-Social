import Image from "next/image";
import Link from "next/link";
import type { Dict, Locale } from "@/lib/i18n";
import { Badge, PlatformIcon } from "../ui";
import { SearchBox } from "../search/SearchBox";
import { siteNow } from "@/lib/site/snapshot";

export function Hero({ t, locale, trending }: { t: Dict; locale: Locale; trending: { platform: "tiktok" | "instagram"; username: string }[] }) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
      <div className="container-w relative grid items-center gap-10 pb-14 pt-14 lg:grid-cols-[1.1fr_.9fr] lg:pt-20">
        <div className="text-center lg:text-start">
          <div className="mb-6 flex justify-center lg:justify-start">
            <Badge tone="blue">❄ {t.hero.badge}</Badge>
          </div>
          <h1 className="text-4xl font-black leading-[1.15] tracking-tight text-ink sm:text-6xl">
            {t.hero.title1} <span className="accent-text">{t.hero.title2}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink-3 lg:mx-0">{t.hero.subtitle}</p>
          <div className="mt-9">
            <SearchBox />
          </div>
          {trending.length > 0 && (
            <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
              <span className="self-center text-xs text-ink-4">{t.search.trending}:</span>
              {trending.map((s) => (
                <Link key={s.platform + s.username} href={`/${s.platform}/${s.username}`} className="chip hover:border-accent-400/50">
                  <PlatformIcon platform={s.platform} className="h-3 w-3" />@{s.username}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-accent-gradient opacity-20 blur-3xl" />
          <div className="card relative overflow-hidden p-2">
            <Image
              src={siteNow().assets.heroImage ? `/api/site-asset/${siteNow().assets.heroImage}` : "/hero.webp"}
              alt={locale === "ar" ? "فروستلي — تحميل وعرض تيك توك وانستقرام" : "Frostly — TikTok & Instagram downloader and viewer"}
              width={1152}
              height={864}
              priority
              className="h-auto w-full animate-floaty rounded-[1.25rem] dark:opacity-90 dark:brightness-90 dark:saturate-150"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
