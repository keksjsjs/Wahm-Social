import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { FEATURED } from "@/lib/content/featured";
import { Searches } from "@/lib/server/db";
import { PageHeader, PlatformIcon, cx } from "@/components/ui";
import { SearchBox } from "@/components/search/SearchBox";

export const metadata = buildMetadata({
  title: "استكشف أشهر حسابات تيك توك وانستقرام | Wahm Explore",
  description: "تصفح أشهر حسابات تيك توك وانستقرام العامة، الأكثر بحثاً هذا الأسبوع، وابدأ تحليل أي حساب.",
  path: "/explore",
});

export const dynamic = "force-dynamic";

export default function ExplorePage({ searchParams }: { searchParams: { p?: string; c?: string } }) {
  const { t, locale } = getDict();
  const p = searchParams.p === "instagram" || searchParams.p === "tiktok" ? searchParams.p : null;
  const cats = [...new Set(FEATURED.map((f) => f.category[locale]))];
  const list = FEATURED.filter((f) => (!p || f.platform === p) && (!searchParams.c || f.category[locale] === searchParams.c));
  const trending = Searches.trending(24);
  const q = (o: Record<string, string | undefined>) => {
    const s = new URLSearchParams(Object.entries({ p: p ?? undefined, c: searchParams.c, ...o }).filter(([, v]) => v) as [string, string][]);
    return `/explore${s.size ? `?${s}` : ""}`;
  };
  return (
    <div className="container-w pb-10">
      <PageHeader title={t.nav.explore} subtitle={t.tagline}>
        <SearchBox size="md" />
      </PageHeader>
      <div className="mb-6 flex flex-wrap gap-2">
        {[null, "tiktok", "instagram"].map((x) => (
          <Link key={x ?? "all"} href={q({ p: x ?? undefined })} className={cx("chip", p === x && "border-gold-400/60 text-gold-200")}>
            {x ? <PlatformIcon platform={x as "tiktok"} className="h-3 w-3" /> : null}
            {x === "tiktok" ? t.search.tiktok : x === "instagram" ? t.search.instagram : locale === "ar" ? "الكل" : "All"}
          </Link>
        ))}
        <span className="mx-2 h-6 w-px bg-white/10" />
        {cats.map((c) => (
          <Link key={c} href={q({ c: searchParams.c === c ? undefined : c })} className={cx("chip", searchParams.c === c && "border-gold-400/60 text-gold-200")}>
            {c}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((f) => (
          <Link key={f.platform + f.username} href={`/${f.platform}/${f.username}`} className="card card-hover p-5">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-gradient text-lg font-black text-navy-950">{f.name[0]}</span>
              <PlatformIcon platform={f.platform} className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 font-bold text-white">{f.name}</div>
            <div className="text-sm text-slate-400" dir="ltr">
              @{f.username}
            </div>
            <div className="mt-3 chip">{f.category[locale]}</div>
          </Link>
        ))}
      </div>
      {trending.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title mb-5">{t.search.trending}</h2>
          <div className="flex flex-wrap gap-2">
            {trending.map((s) => (
              <Link key={s.platform + s.username} href={`/${s.platform}/${s.username}`} className="chip hover:border-gold-400/50">
                <PlatformIcon platform={s.platform} className="h-3 w-3" /> @{s.username} <span className="text-gold-400">{s.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
