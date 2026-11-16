/** Plain server-rendered form controls for the admin panel (no client JS). */
import type { Bi } from "@/lib/site/types";

const inputCls = "w-full rounded-xl border border-line bg-surface/70 px-3 py-2 text-sm text-ink outline-none focus:border-accent-400";

export function Text({ name, label, value, hint, dir, type = "text", placeholder }: { name: string; label: string; value?: string; hint?: string; dir?: "ltr" | "rtl"; type?: string; placeholder?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-semibold text-ink-2">{label}</span>
      <input name={name} defaultValue={value} type={type} dir={dir} placeholder={placeholder} className={inputCls} autoComplete="off" />
      {hint && <span className="block text-xs text-ink-4">{hint}</span>}
    </label>
  );
}

export function Area({ name, label, value, hint, rows = 3, dir }: { name: string; label: string; value?: string; hint?: string; rows?: number; dir?: "ltr" | "rtl" }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-semibold text-ink-2">{label}</span>
      <textarea name={name} defaultValue={value} rows={rows} dir={dir} className={inputCls} />
      {hint && <span className="block text-xs text-ink-4">{hint}</span>}
    </label>
  );
}

/** Arabic + English pair → fields `${name}_ar` / `${name}_en`. */
export function BiText({ name, label, value, area }: { name: string; label: string; value: Bi; area?: boolean }) {
  const C = area ? Area : Text;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <C name={`${name}_ar`} label={`${label} (عربي)`} value={value.ar} dir="rtl" />
      <C name={`${name}_en`} label={`${label} (English)`} value={value.en} dir="ltr" />
    </div>
  );
}

export function Toggle({ name, label, checked, hint }: { name: string; label: string; checked: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-line bg-surface/50 p-3">
      <input type="hidden" name={`${name}__present`} value="1" />
      <input type="checkbox" name={name} defaultChecked={checked} className="mt-1 h-4 w-4 accent-[rgb(var(--accent-500))]" />
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {hint && <span className="block text-xs text-ink-4">{hint}</span>}
      </span>
    </label>
  );
}

export function Select({ name, label, value, options }: { name: string; label: string; value: string; options: [string, string][] }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-semibold text-ink-2">{label}</span>
      <select name={name} defaultValue={value} className={inputCls}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Submit({ label = "حفظ" }: { label?: string }) {
  return (
    <button type="submit" className="btn-primary">
      {label}
    </button>
  );
}
