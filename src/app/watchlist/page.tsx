import { getDict } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { PageHeader, ProBadge } from "@/components/ui";
import { WatchlistView } from "@/components/watchlist/WatchlistView";
import { ProGate } from "@/components/profile/ProGate";
import { currentUser } from "@/lib/server/auth";
import { hasFeature } from "@/lib/plans";

export const metadata = buildMetadata({ title: "قائمة المراقبة | Wahm Watchlist", path: "/watchlist", description: "راقب نمو متابعي حسابات تيك توك وانستقرام المفضلة لديك." });
export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const { t } = getDict();
  const user = await currentUser();
  const pro = hasFeature(user?.plan, "watchlist");
  return (
    <div className="container-w max-w-5xl pb-10">
      <PageHeader title={t.watchlist.title} subtitle={t.watchlist.subtitle} eyebrow={<ProBadge />} />
      <ProGate locked={!pro} t={t}>
        {pro ? <WatchlistView /> : <div className="h-64" />}
      </ProGate>
    </div>
  );
}
