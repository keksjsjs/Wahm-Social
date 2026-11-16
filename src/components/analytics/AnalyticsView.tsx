import type { Analytics } from "@/lib/analytics";
import type { Dict, Locale } from "@/lib/i18n";
import { interpolate } from "@/lib/i18n";
import { compact, percent } from "@/lib/format";
import { BarChart, Gauge, LineChart } from "./Charts";
import { PostCard } from "../profile/PostGrid";
import { ProGate } from "../profile/ProGate";
import { Stat } from "../ui";

export function AnalyticsView({ a, t, locale, pro }: { a: Analytics; t: Dict; locale: Locale; pro: boolean }) {
  const dayShort = t.days.map((d) => d.slice(0, locale === "ar" ? 3 : 3));
  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-4">{interpolate(t.analytics.sample, { n: a.postsAnalyzed })}</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label={t.analytics.engagement} value={percent(a.engagementRate, 2)} />
        <Stat label={t.analytics.avgViews} value={compact(a.avgViews, locale)} />
        <Stat label={t.analytics.avgLikes} value={compact(a.avgLikes, locale)} />
        <Stat label={t.analytics.frequency} value={a.postsPerWeek} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card flex flex-col items-center justify-center p-6">
          <Gauge value={a.growthScore} label={t.analytics.score} />
          <div className="mt-3 chip">
            {t.analytics.tier}: <b className="text-accent-600 dark:text-accent-300">{t.analytics.tiers[a.tier]}</b>
          </div>
        </div>
        <div className="card p-6 md:col-span-2">
          <h3 className="mb-3 font-bold text-ink">{t.analytics.topHashtags}</h3>
          <div className="flex flex-wrap gap-2">
            {a.topHashtags.length ? (
              a.topHashtags.slice(0, pro ? 15 : 3).map((h) => (
                <span key={h.tag} className="chip" dir="ltr">
                  #{h.tag} <span className="text-accent-500 dark:text-accent-400">×{h.count}</span>
                  {pro && <span className="text-ink-4">♥{compact(h.avgLikes, "en")}</span>}
                </span>
              ))
            ) : (
              <span className="text-sm text-ink-4">—</span>
            )}
            {!pro && a.topHashtags.length > 3 && <span className="chip text-accent-600 dark:text-accent-300">+{a.topHashtags.length - 3} PRO</span>}
          </div>
        </div>
      </div>

      <ProGate locked={!pro} t={t}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label={t.analytics.avgComments} value={compact(a.avgComments, locale)} />
            <Stat label={t.analytics.gap} value={a.medianGapHours} />
            <Stat label={t.analytics.bestDay} value={a.bestWeekday !== null ? t.days[a.bestWeekday] : "—"} />
            <Stat label={t.analytics.bestHour} value={a.bestHour !== null ? `${a.bestHour}:00` : "—"} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card p-6">
              <h3 className="mb-4 font-bold text-ink">{t.analytics.weekday}</h3>
              <BarChart values={a.weekdayHistogram} labels={dayShort} highlight={a.bestWeekday} />
            </div>
            <div className="card p-6">
              <h3 className="mb-4 font-bold text-ink">{t.analytics.hours}</h3>
              <BarChart values={a.hourHistogram} labels={a.hourHistogram.map((_, i) => (i % 6 === 0 ? String(i) : ""))} highlight={a.bestHour} />
            </div>
          </div>
          <div className="card p-6">
            <h3 className="mb-4 font-bold text-ink">{t.analytics.timeline}</h3>
            <LineChart points={a.timeline.map((p) => ({ x: p.t, y: p.likes }))} />
          </div>
          <div className="card p-6">
            <h3 className="font-bold text-ink">{t.analytics.earnings}</h3>
            <div className="accent-text mt-2 text-3xl font-black" dir="ltr">
              ${compact(a.estimatedEarnings.min, "en")} – ${compact(a.estimatedEarnings.max, "en")}
            </div>
          </div>
          {a.topPosts.length > 0 && (
            <div>
              <h3 className="mb-3 font-bold text-ink">{t.analytics.topPosts}</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {a.topPosts.map((p) => (
                  <PostCard key={p.id} post={p} locale={locale} />
                ))}
              </div>
            </div>
          )}
        </div>
      </ProGate>
    </div>
  );
}
