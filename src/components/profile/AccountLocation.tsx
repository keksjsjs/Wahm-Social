import type { ProfileLocation } from "@/lib/platforms/types";
import type { Locale } from "@/lib/i18n";

const flag = (cc: string) => cc.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

function regionName(cc: string, locale: Locale) {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(cc.toUpperCase()) ?? cc;
  } catch {
    return cc;
  }
}

function languageName(code: string, locale: Locale) {
  try {
    return new Intl.DisplayNames([locale], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Country / current location / language of a public account, with its basis stated. */
export function AccountLocation({ loc, locale }: { loc: ProfileLocation; locale: Locale }) {
  const ar = locale === "ar";
  const others = loc.recent.filter((r) => r.code !== loc.current);
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
      {loc.current && (
        <span className="chip !border-accent-400/40 !bg-accent-500/10 font-semibold text-ink" title={ar ? "حسب آخر فيديو عام" : "From the latest public video"}>
          <span aria-hidden>{flag(loc.current)}</span>
          {ar ? "دولة الحساب الحالية:" : "Current country:"} {regionName(loc.current, locale)}
        </span>
      )}
      {loc.place && (
        <span className="chip text-ink-2">
          📍 {ar ? "آخر موقع موسوم:" : "Last tagged place:"} {loc.place}
        </span>
      )}
      {others.length > 0 && (
        <span className="chip text-ink-3">
          {ar ? "دول أخرى نشر منها مؤخراً:" : "Also posted from:"} {others.map((o) => `${flag(o.code)} ${regionName(o.code, locale)}`).join("، ")}
        </span>
      )}
      {loc.language && (
        <span className="chip text-ink-3">
          🌐 {ar ? "لغة الحساب:" : "Account language:"} {languageName(loc.language, locale)}
        </span>
      )}
      {loc.current && (
        <span className="text-[11px] text-ink-4">
          {ar ? `* مستنتجة من آخر ${loc.sample} فيديو عام (مكان النشر)` : `* based on where the latest ${loc.sample} public video(s) were posted`}
        </span>
      )}
    </div>
  );
}
