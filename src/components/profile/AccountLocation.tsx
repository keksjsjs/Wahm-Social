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
  const basis =
    loc.source === "profile"
      ? ar
        ? "* من حقل الدولة في ملف الحساب (بدون الحاجة لمنشورات)"
        : "* from the account's own region field (works with zero posts)"
      : loc.source === "video" && loc.current
        ? ar
          ? `* مستنتجة من مكان نشر ${loc.sample} فيديو عام حديث (الأغلبية)${loc.via === "tikwm" ? " — عبر tikwm" : " — من صفحات تيك توك"}`
          : `* majority of where ${loc.sample} recent public video(s) were posted${loc.via === "tikwm" ? " (via tikwm)" : " (TikTok video pages)"}`
        : null;
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
      {loc.current && (
        <span className="chip !border-accent-400/40 !bg-accent-500/10 font-semibold text-ink">
          <span aria-hidden>{flag(loc.current)}</span>
          {ar ? "دولة الحساب:" : "Account country:"} {regionName(loc.current, locale)}
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
      {basis && <span className="text-[11px] text-ink-4">{basis}</span>}
    </div>
  );
}
