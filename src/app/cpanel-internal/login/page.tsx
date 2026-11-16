import { redirect } from "next/navigation";
import { adminBase, adminHref } from "@/lib/admin/path";
import { isAdmin } from "@/lib/admin/session";
import { Flash } from "@/components/admin/Flash";
import { LogoMark } from "@/components/layout/Logo";

export const dynamic = "force-dynamic";

export default async function Login({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  if (await isAdmin()) redirect(adminHref());
  return (
    <div className="grid min-h-screen place-items-center px-4" dir="rtl">
      <form method="post" action={`${adminBase()}/api/login`} className="card w-full max-w-sm space-y-5 p-8" data-admin-login>
        <div className="flex flex-col items-center gap-3 text-center">
          <LogoMark size={48} />
          <h1 className="text-xl font-black text-ink">لوحة التحكم</h1>
          <p className="text-sm text-ink-3">ادخل كلمة المرور</p>
        </div>
        <Flash ok={searchParams.ok} err={searchParams.err} />
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-xl border border-line bg-surface/70 px-3 py-2.5 text-ink outline-none focus:border-accent-400"
          placeholder="••••••••"
          dir="ltr"
        />
        <button className="btn-primary w-full">دخول</button>
      </form>
    </div>
  );
}
