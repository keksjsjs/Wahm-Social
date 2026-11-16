import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { ARTICLES } from "@/lib/content/blog";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui";

export const metadata = buildMetadata({
  title: "مدونة فروستلي — نصائح تيك توك وانستقرام | Frostly Blog",
  description: "مقالات عن النمو على تيك توك وانستقرام، معدل التفاعل، أفضل أوقات النشر، والتحميل الآمن.",
  path: "/blog",
});

export default function BlogIndex() {
  const { t, locale } = getDict();
  return (
    <div className="container-w pb-10">
      <PageHeader title={t.nav.blog} subtitle={t.tagline} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ARTICLES.map((a) => (
          <Link key={a.slug} href={`/blog/${a.slug}`} className="card card-hover flex flex-col p-6">
            <div className="flex gap-2">
              {a.tags.map((tag) => (
                <span key={tag} className="chip">
                  #{tag}
                </span>
              ))}
            </div>
            <h2 className="mt-4 text-lg font-bold leading-8 text-ink">{a.title[locale]}</h2>
            <p className="mt-2 flex-1 text-sm leading-7 text-ink-3">{a.excerpt[locale]}</p>
            <div className="mt-4 text-xs text-accent-500 dark:text-accent-400">{a.date}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
