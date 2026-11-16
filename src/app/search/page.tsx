import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { SearchBox } from "@/components/search/SearchBox";
import { routeForQuery } from "@/lib/route";
import { PageHeader } from "@/components/ui";
import type { Platform } from "@/lib/platforms/types";

export const metadata = buildMetadata({ title: "بحث | Frostly", path: "/search", noindex: true });

export default function SearchPage({ searchParams }: { searchParams: { q?: string; p?: string } }) {
  const platform: Platform = searchParams.p === "instagram" ? "instagram" : "tiktok";
  if (searchParams.q) {
    const href = routeForQuery(searchParams.q, platform);
    if (href) redirect(href);
  }
  const { t } = getDict();
  return (
    <div className="container-w pb-10">
      <PageHeader title={t.search.button} subtitle={t.tagline} />
      <SearchBox initialPlatform={platform} initialQuery={searchParams.q ?? ""} />
    </div>
  );
}
