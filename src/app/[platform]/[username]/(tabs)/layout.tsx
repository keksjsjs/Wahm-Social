import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import { loadProfile, parseRoute } from "@/lib/server/loaders";
import { profileMetadata, jsonLdProfile, jsonLdBreadcrumbs, buildMetadata } from "@/lib/seo";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { NoticeBar, SourceBadge } from "@/components/ui/SourceBadge";
import { JsonLd } from "@/components/seo/JsonLd";
import { SearchBox } from "@/components/search/SearchBox";
import { currentUser } from "@/lib/server/auth";
import { hasFeature } from "@/lib/plans";

type Params = { platform: string; username: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const r = parseRoute(params.platform, params.username);
  if (!r) return {};
  const p = await loadProfile(r.platform, r.username);
  if (!p.ok) return buildMetadata({ title: `@${r.username} | Wahm Social`, path: `/${r.platform}/${r.username}`, noindex: true });
  return { ...profileMetadata(p.value.data), robots: p.value.source === "demo" ? { index: false } : undefined };
}

export default async function ProfileLayout({ params, children }: { params: Params; children: React.ReactNode }) {
  const r = parseRoute(params.platform, params.username);
  if (!r) notFound();
  const { t, locale } = getDict();
  const res = await loadProfile(r.platform, r.username);
  if (!res.ok && res.code === "not_found") notFound();
  const user = await currentUser();
  return (
    <div className="container-w py-8">
      <div className="mb-6">
        <SearchBox size="md" initialPlatform={r.platform} />
      </div>
      {res.ok ? (
        <>
          <JsonLd
            data={[
              jsonLdProfile(res.value.data),
              jsonLdBreadcrumbs([
                { name: "Wahm Social", path: "/" },
                { name: r.platform === "tiktok" ? "TikTok" : "Instagram", path: `/explore?p=${r.platform}` },
                { name: `@${r.username}`, path: `/${r.platform}/${r.username}` },
              ]),
            ]}
          />
          <NoticeBar notice={res.value.notice} />
          <div className="mb-3 flex justify-end">
            <SourceBadge source={res.value.source} t={t} />
          </div>
          <ProfileHeader p={res.value.data} t={t} locale={locale} canPro={hasFeature(user?.plan, "watchlist")} />
          <div className="mt-6">
            <ProfileTabs platform={r.platform} username={r.username} t={t} />
          </div>
          <div className="mt-6">{res.value.data.isPrivate ? <ErrorPanel code="private_account" message="" t={t} /> : children}</div>
        </>
      ) : (
        <ErrorPanel code={res.code} message={res.message} t={t} />
      )}
    </div>
  );
}
