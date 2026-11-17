import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n/server";
import { loadPosts, loadProfile, parseRoute } from "@/lib/server/loaders";
import { analyze } from "@/lib/analytics";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { currentUser } from "@/lib/server/auth";
import { hasFeature } from "@/lib/plans";
import { featureOn } from "@/lib/site/flags";
import { FeatureOff } from "@/components/ui/FeatureOff";

export const dynamic = "force-dynamic";

export default async function AnalyticsTab({ params }: { params: { platform: string; username: string } }) {
  const r = parseRoute(params.platform, params.username);
  if (!r) notFound();
  if (!featureOn("analytics")) return <FeatureOff feature="analytics" />;
  const { t, locale } = getDict();
  const [p, posts] = await Promise.all([loadProfile(r.platform, r.username), loadPosts(r.platform, r.username, 24)]);
  if (!p.ok) return <ErrorPanel code={p.code} message={p.message} t={t} />;
  if (!posts.ok) return <ErrorPanel code={posts.code} message={posts.message} t={t} />;
  const user = await currentUser();
  return <AnalyticsView a={analyze(p.value.data, posts.value.data)} t={t} locale={locale} pro={hasFeature(user?.plan, "advanced_analytics")} />;
}
