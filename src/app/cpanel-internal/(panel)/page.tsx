import Link from "next/link";
import { guardPage } from "@/lib/admin/pageGuard";
import { PanelShell, type Flashy } from "@/components/admin/PanelShell";
import { Section } from "@/components/admin/Section";
import { ADMIN_TABS } from "@/components/admin/AdminNav";
import { Stat } from "@/components/ui";
import { Payments, Searches, Users } from "@/lib/server/db";
import { cache } from "@/lib/server/cache";
import { env, billingMode } from "@/lib/env";
import { dataStore } from "@/lib/admin/storage";
import { snapshot } from "@/lib/site/snapshot";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Overview({ searchParams }: { searchParams: Flashy }) {
  const { base, settings } = await guardPage();
  const users = Users.all();
  const revenue = Payments.all().filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const c = cache.stats();
  const st = dataStore().status();
  const snap = snapshot();
  return (
    <PanelShell active="" title="الرئيسية" flash={searchParams}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="المستخدمين" value={users.length} />
        <Stat label="مشتركين" value={users.filter((u) => u.plan !== "free").length} />
        <Stat label="الإيراد (USD)" value={`$${revenue.toFixed(2)}`} />
        <Stat label="عمليات البحث" value={Searches.total()} />
        <Stat label="نسبة الكاش" value={c.hits + c.misses ? Math.round((c.hits / (c.hits + c.misses)) * 100) + "%" : "—"} />
      </div>
      <Section title="حالة سريعة">
        <ul className="grid gap-2 text-sm text-ink-2 md:grid-cols-2">
          <li>💾 التخزين: {st.detail} — {st.kind === "git" ? (st.ok ? "✅ متصل" : "⚠️ " + (st.lastError || "لم يتصل بعد")) : "⚠️ مؤقت"}</li>
          <li>🕒 آخر تحميل للإعدادات: {snap.loadedAt ? timeAgo(snap.loadedAt, "ar") : "—"}</li>
          <li>🌐 البروكسي: {env.scraperProxy ? "✅ مضبوط" : "❌ غير مضبوط"}</li>
          <li>📸 جلسة انستقرام: {env.igSessionId ? "✅" : "❌"} · 🎵 جلسة تيك توك: {env.tiktokCookie || env.tiktokSessionId ? "✅" : "❌"}</li>
          <li>💳 الدفع: {billingMode()} · وضع التجربة: {env.demoMode}</li>
          <li>📝 آخر تعديل: {settings.updatedAt ? new Date(settings.updatedAt).toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" }) : "لا يوجد"}</li>
        </ul>
        {snap.error && <p className="text-sm text-red-500">⚠️ {snap.error}</p>}
      </Section>
      <Section title="أقسام اللوحة" desc="كل شي في الموقع تقدر تعدله من هنا بدون كود. التعديلات تنحفظ في مستودع GitHub خاص وتبقى حتى بعد إعادة النشر.">
        <div className="grid gap-3 md:grid-cols-3">
          {ADMIN_TABS.slice(1).map(([k, label]) => (
            <Link key={k} href={`${base}/${k}`} prefetch={false} className="card p-4 text-sm font-semibold text-ink hover:border-accent-400/60">
              {label}
            </Link>
          ))}
        </div>
      </Section>
      <Section title="آخر عمليات البحث">
        <ul className="space-y-1 text-sm">
          {Searches.recent(12).map((s, i) => (
            <li key={i} className="flex justify-between border-b border-line py-1.5">
              <span className="text-ink-2" dir="ltr">
                {s.platform}:@{s.username}
              </span>
              <span className="text-ink-4">{timeAgo(s.at, "ar")}</span>
            </li>
          ))}
        </ul>
      </Section>
    </PanelShell>
  );
}
