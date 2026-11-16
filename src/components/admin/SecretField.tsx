import type { SecretDef } from "@/lib/admin/secrets-def";

/** Masked secret input: never renders the stored value, only where it comes from and its length. */
export function SecretField({ def, panel, renderEnv }: { def: SecretDef; panel: number; renderEnv: number }) {
  const status = panel ? `✅ مضبوط من اللوحة (${panel} حرف)` : renderEnv ? `✅ مضبوط من Render (${renderEnv} حرف)` : "❌ غير مضبوط";
  const cls = "w-full rounded-xl border border-line bg-surface/70 px-3 py-2 text-sm text-ink outline-none focus:border-accent-400";
  return (
    <div className="space-y-1 rounded-xl border border-line bg-surface/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink-2">{def.label}</span>
        <span className="text-xs text-ink-3">{status}</span>
      </div>
      {def.multiline ? (
        <textarea name={def.key} rows={3} dir="ltr" placeholder="اتركه فاضي عشان يبقى زي ما هو — الصق قيمة جديدة للاستبدال" className={cls} autoComplete="off" spellCheck={false} />
      ) : (
        <input name={def.key} type="password" dir="ltr" placeholder="اتركه فاضي عشان يبقى زي ما هو" className={cls} autoComplete="new-password" spellCheck={false} />
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-4">
        <span>{def.hint}</span>
        {panel > 0 && (
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name={`clear_${def.key}`} /> حذف قيمة اللوحة{renderEnv ? " (يرجع لقيمة Render)" : ""}
          </label>
        )}
      </div>
    </div>
  );
}
