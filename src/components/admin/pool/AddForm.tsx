import type { PoolKind } from "@/lib/pools/types";

const cls = "w-full rounded-xl border border-line bg-surface/70 px-3 py-2 text-sm text-ink outline-none focus:border-accent-400";

/** "Add" form for each pool kind. Values go straight to the encrypted store and are never shown again. */
export function AddForm({ kind, action }: { kind: PoolKind; action: string }) {
  return (
    <details className="rounded-2xl border border-accent-500/30 bg-accent-500/5 p-3">
      <summary className="cursor-pointer text-sm font-bold text-accent-600 dark:text-accent-200">➕ {ADD_LABEL[kind]}</summary>
      <form method="post" action={action} className="mt-3 space-y-3">
        <input type="hidden" name="op" value="add" />
        <input name="label" placeholder="اسم مختصر (اختياري) — مثال: Webshare ثابت" className={cls} />
        {kind === "proxies" && (
          <textarea name="url" rows={3} dir="ltr" spellCheck={false} autoComplete="off" className={cls} placeholder={'http://user:pass@host:port/\nأو سطر curl --proxy "http://…" كامل\nأو host:port:user:pass — كل سطر بروكسي'} />
        )}
        {kind === "relays" && <input name="url" dir="ltr" className={cls} placeholder="https://name.account.workers.dev" />}
        {kind === "tiktok" && <textarea name="cookie" rows={4} dir="ltr" spellCheck={false} autoComplete="off" className={cls} placeholder="سطر الكوكيز كامل من متصفح مسجّل دخول (sessionid=…; msToken=…; tt_csrf_token=…)" />}
        {kind === "instagram" && (
          <>
            <textarea name="cookie" rows={3} dir="ltr" spellCheck={false} autoComplete="off" className={cls} placeholder="الصق سطر الكوكيز كامل (sessionid=…; csrftoken=…; ds_user_id=…) — أو عبّي الخانات تحت" />
            <div className="grid gap-2 md:grid-cols-2">
              {["sessionid", "csrftoken", "dsUserId", "mid", "datr"].map((n) => (
                <input key={n} name={n} type="password" dir="ltr" autoComplete="new-password" placeholder={n === "dsUserId" ? "ds_user_id" : n} className={cls} />
              ))}
            </div>
          </>
        )}
        <button className="btn-primary">إضافة</button>
      </form>
    </details>
  );
}

const ADD_LABEL: Record<PoolKind, string> = {
  proxies: "إضافة بروكسي (أو أكثر، كل سطر واحد)",
  relays: "إضافة رابط Worker",
  tiktok: "إضافة جلسة تيك توك",
  instagram: "إضافة جلسة انستقرام",
};
