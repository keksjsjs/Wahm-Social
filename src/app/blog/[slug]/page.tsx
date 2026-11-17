import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import { visibleArticle as articleBySlug, visibleArticles } from "@/lib/content/visible";
import { absUrl, buildMetadata, jsonLdBreadcrumbs } from "@/lib/seo";
import { Markdown } from "@/components/content/Markdown";
import { JsonLd } from "@/components/seo/JsonLd";
import { SearchBox } from "@/components/search/SearchBox";


export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = articleBySlug(params.slug);
  if (!a) return {};
  return buildMetadata({ title: `${a.title.ar} | Frostly Blog`, description: a.excerpt.ar, path: `/blog/${a.slug}`, type: "article", keywords: a.tags });
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const a = articleBySlug(params.slug);
  if (!a) notFound();
  const { locale, t } = getDict();
  const related = visibleArticles().filter((x) => x.slug !== a.slug && x.tags.some((tg) => a.tags.includes(tg))).slice(0, 3);
  return (
    <article className="container-w max-w-3xl py-14">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: a.title[locale],
            description: a.excerpt[locale],
            datePublished: a.date,
            author: { "@type": "Organization", name: "Frostly" },
            mainEntityOfPage: absUrl(`/blog/${a.slug}`),
          },
          jsonLdBreadcrumbs([
            { name: "Frostly", path: "/" },
            { name: t.nav.blog, path: "/blog" },
            { name: a.title[locale], path: `/blog/${a.slug}` },
          ]),
        ]}
      />
      <Link href="/blog" className="text-sm text-accent-600 dark:text-accent-300 hover:underline">
        ← {t.nav.blog}
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">{a.title[locale]}</h1>
      <div className="mt-3 text-sm text-ink-4">{a.date}</div>
      <div className="card mt-8 p-6 sm:p-10">
        <Markdown source={a.body[locale]} />
      </div>
      <div className="mt-10">
        <SearchBox size="md" />
      </div>
      {related.length > 0 && (
        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {related.map((r) => (
            <Link key={r.slug} href={`/blog/${r.slug}`} className="card card-hover p-4 text-sm font-semibold text-ink">
              {r.title[locale]}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}

export const dynamic = "force-dynamic";
