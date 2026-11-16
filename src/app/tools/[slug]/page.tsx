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

export function generateStaticParams() {
  return Object.keys(TOOLS).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = TOOLS[params.slug];
  if (!tool) return {};
  return buildMetadata({ title: `${tool.title.ar} | ${tool.title.en} — Wahm`, description: `${tool.desc.ar} ${tool.desc.en}`, path: `/tools/${params.slug}` });
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = TOOLS[params.slug];
  if (!tool) notFound();
  const { locale, t } = getDict();
  return (
    <div className="container-w pb-10">
      <PageHeader title={tool.title[locale]} subtitle={tool.desc[locale]} eyebrow={<Badge tone="gold">Wahm Tools</Badge>} />
      {tool.mode === "download" && <DownloadCenter />}
      {tool.mode === "profile" && <SearchBox initialPlatform={tool.platform} />}
      {tool.mode === "stories" && <QuickJump tab="stories" platforms={["instagram"]} />}
      {tool.mode === "analytics" && <QuickJump tab="analytics" platforms={[tool.platform]} />}
      <div className="mt-16">
        <FeatureGrid t={t} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
