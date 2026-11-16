import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import { TOOLS } from "@/lib/content/pages";
import { buildMetadata } from "@/lib/seo";
import { PageHeader, Badge } from "@/components/ui";
import { DownloadCenter } from "@/components/download/DownloadCenter";
import { SearchBox } from "@/components/search/SearchBox";
import { QuickJump } from "@/components/search/QuickJump";
import { FeatureGrid } from "@/components/content/FeatureGrid";
import { PopularSearches } from "@/components/content/PopularSearches";
import { Faq } from "@/components/content/Faq";
import { FAQ } from "@/lib/content/faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { jsonLdFaq, jsonLdSoftware } from "@/lib/seo";

export function generateStaticParams() {
  return Object.keys(TOOLS).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = TOOLS[params.slug];
  if (!tool) return {};
  return buildMetadata({ title: `${tool.title.ar} | ${tool.title.en} — Frostly`, description: `${tool.desc.ar} ${tool.desc.en}`, path: `/tools/${params.slug}`, keywords: tool.keywords });
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = TOOLS[params.slug];
  if (!tool) notFound();
  const { locale, t } = getDict();
  return (
    <div className="container-w pb-10">
      <PageHeader title={tool.title[locale]} subtitle={tool.desc[locale]} eyebrow={<Badge tone="gold">Frostly Tools</Badge>} />
      {tool.mode === "download" && <DownloadCenter />}
      {tool.mode === "profile" && <SearchBox initialPlatform={tool.platform} />}
      {tool.mode === "stories" && <QuickJump tab="stories" platforms={["instagram"]} />}
      {tool.mode === "analytics" && <QuickJump tab="analytics" platforms={[tool.platform]} />}
      <JsonLd data={[jsonLdSoftware(), jsonLdFaq(FAQ[locale])]} />
      <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2">
        {tool.keywords.map((k) => (
          <span key={k} className="chip">
            {k}
          </span>
        ))}
      </div>
      <div className="mt-16">
        <FeatureGrid t={t} />
      </div>
      <div className="mt-16">
        <PopularSearches locale={locale} />
      </div>
      <div className="mt-16">
        <Faq items={FAQ[locale]} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
