import { guardPage } from "@/lib/admin/pageGuard";
import { PanelShell, type Flashy } from "@/components/admin/PanelShell";
import { Section } from "@/components/admin/Section";
import { dataStore } from "@/lib/admin/storage";
import { snapshot } from "@/lib/site/snapshot";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Reuses /api/health?ig=1 (presence flags + last attempt per source; never secret values). */
async function health(): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`http://127.0.0.1:${process.env.PORT || 3000}/api/health?ig=1`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const LABELS: Record<string, string> = {
  tiktokLastTikwmTry: "tikwm (تيك توك احتياطي)",
  tiktokLastCountikTry: "countik",
  tiktokLastRegionTry: "دولة تيك توك",
  tiktokLastFollowerTry: "متابعين تيك توك (ويب)",
  tiktokLastBrowserTry: "متابعين تيك توك (متصفح)",
  instagramLastLookup: "انستقرام آخر بحث",
  tiktokResearch: "TikTok Research API",
};

export default async function StatusPage({ searchParams }: { searchParams: Flashy }) {
  const { base } = await guardPage();
  const h = await health();
  const st = dataStore().status();
  const snap = snapshot();
  const flags = h ? Object.entries(h).filter(([, v]) => typeof v === "boolean" || typeof v === "string" || typeof v === "number") : [];
  const sources = h ? Object.entries(h).filter(([k, v]) => v && typeof v === "object" && k !== "cache") : [];
  return (
    <PanelShell active="status" title="الحالة والكاش" flash={searchParams}>
      <Section title="⚡ أدوات">
        <div className="flex flex-wrap gap-2">
          <form method="post" action={`${base}/api/cache`}>
            <button className="btn-primary">🧹 مسح الكاش</button>
          </form>
          <form method="post" action={`${base}/api/reload`}>
            <button className="btn-ghost">🔄 إعادة تحميل الإعدادات من التخزين</button>
          </form>
        </div>
      </Section>
      <Section title="💾 التخزين">
        <ul className="space-y-1 text-sm text-ink-2">
          <li>النوع: {st.detail}</li>
          <li>الحالة: {st.ok ? "✅ متصل" : `⚠️ ${st.lastError || "لم يتصل بعد"}`}</li>
          <li>آخر مزامنة: {st.lastSyncAt ? timeAgo(st.lastSyncAt, "ar") : "—"}</li>
          {snap.error && <li className="text-red-500">خطأ: {snap.error}</li>}
        </ul>
      </Section>
      <Section title="🩺 حالة السيرفر">
        {!h ? (
          <p className="text-sm text-red-500">تعذر قراءة /api/health</p>
        ) : (
          <div className="grid gap-2 text-sm md:grid-cols-3">
            {flags.map(([k, v]) => (
              <div key={k} className="rounded-xl border border-line bg-surface/40 px-3 py-2">
                <span className="text-ink-4">{k}</span>: <b className="text-ink">{typeof v === "boolean" ? (v ? "✅" : "❌") : String(v)}</b>
              </div>
            ))}
          </div>
        )}
      </Section>
      <Section title="📡 آخر محاولة لكل مصدر" desc="الملاحظة tikwm_blocked تعني أن Cloudflare حاجب عنوان السيرفر — الحل بروكسي.">
        <div className="space-y-3">
          {sources.map(([k, v]) => (
            <div key={k} className="rounded-xl border border-line bg-surface/40 p-3">
              <p className="mb-1 text-sm font-semibold text-ink">{LABELS[k] ?? k}</p>
              <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-ink-3" dir="ltr">
                {JSON.stringify(v, null, 2).slice(0, 2000)}
              </pre>
            </div>
          ))}
        </div>
      </Section>
    </PanelShell>
  );
}
