import { getDict } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { PageHeader, ProBadge } from "@/components/ui";
import { QuickJump } from "@/components/search/QuickJump";

export const metadata = buildMetadata({
  title: "تحليل حساب تيك توك وانستقرام — معدل التفاعل وأفضل وقت للنشر | Frostly Analytics",
  description: "احسب معدل التفاعل، متوسط المشاهدات، أفضل وقت للنشر، أقوى الهاشتاقات وتقدير سعر الإعلان لأي حساب عام.",
  path: "/analytics",
});

export default function AnalyticsLanding() {
  const { t } = getDict();
  const items = [t.analytics.engagement, t.analytics.avgViews, t.analytics.bestDay, t.analytics.bestHour, t.analytics.topHashtags, t.analytics.earnings, t.analytics.score, t.analytics.timeline];
  return (
    <div className="container-w pb-10">
      <PageHeader title={t.analytics.title} subtitle={t.features.analytics[1]} />
      <QuickJump tab="analytics" />
      <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((x, i) => (
          <div key={x} className="card flex items-center justify-between p-4 text-sm text-ink-2">
            {x} {i > 1 && <ProBadge />}
          </div>
        ))}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
