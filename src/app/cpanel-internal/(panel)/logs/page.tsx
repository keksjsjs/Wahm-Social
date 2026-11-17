import { guardPage } from "@/lib/admin/pageGuard";
import { PanelShell, type Flashy } from "@/components/admin/PanelShell";
import { Section } from "@/components/admin/Section";
import { recentErrors } from "@/lib/server/errorLog";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

const SCOPE: Record<string, string> = {
  instagram: "📸 انستقرام",
  proxy: "🌐 بروكسي",
  relay: "☁️ Worker",
  tiktok: "🎵 تيك توك",
  tikwm: "🧩 tikwm",
  api: "⚙️ API",
  loader: "📄 صفحة",
};

export default async function LogsPage({ searchParams }: { searchParams: Flashy }) {
  const { base } = await guardPage();
  const rows = recentErrors(150);
  return (
    <PanelShell active="logs" title="سجل الأخطاء الأخيرة" flash={searchParams}>
      <Section title="📜 آخر المشاكل" desc="من ذاكرة السيرفر (تنمسح مع كل إعادة تشغيل). الرسائل منظّفة: ما فيها كلمات سر ولا كوكيز ولا روابط بروكسي.">
        <form method="post" action={`${base}/api/logs`}>
          <button className="btn-ghost btn-sm">🧹 مسح السجل</button>
        </form>
        {rows.length === 0 ? (
          <p className="text-sm text-ink-3">ما فيه أخطاء مسجلة 🎉</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((r, i) => (
              <li key={i} className="rounded-xl border border-line bg-surface/40 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-4">
                  <span className="font-semibold text-ink-2">{SCOPE[r.scope] ?? r.scope}</span>
                  <span>
                    {timeAgo(Date.parse(r.at), "ar")}
                    {r.count > 1 ? ` · تكرر ${r.count} مرة` : ""}
                  </span>
                </div>
                <p className="mt-1 break-words text-ink-2" dir="ltr">
                  {r.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </PanelShell>
  );
}
