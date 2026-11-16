import { adminBase } from "@/lib/admin/path";
import { AdminNav } from "./AdminNav";
import { Flash } from "./Flash";

export type Flashy = { ok?: string; err?: string };

export function PanelShell({ active, title, flash, children }: { active: string; title: string; flash: Flashy; children: React.ReactNode }) {
  const base = adminBase();
  return (
    <div className="container-w max-w-5xl space-y-6 py-8" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-accent-600 dark:text-accent-300">❄ لوحة تحكم فروستلي</p>
          <h1 className="text-2xl font-black text-ink">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" rel="noreferrer" className="btn-ghost btn-sm">
            فتح الموقع ↗
          </a>
          <form method="post" action={`${base}/api/logout`}>
            <button className="btn-ghost btn-sm">تسجيل خروج</button>
          </form>
        </div>
      </header>
      <AdminNav base={base} active={active} />
      <Flash ok={flash.ok} err={flash.err} />
      <div className="space-y-6">{children}</div>
    </div>
  );
}
