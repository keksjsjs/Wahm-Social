/** Locale-aware formatting helpers shared by client and server. */
export type Locale = "ar" | "en";

export function compact(n: number | undefined | null, locale: Locale = "ar"): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  const units: [number, string, string][] = [
    [1e9, "B", " مليار"],
    [1e6, "M", " مليون"],
    [1e3, "K", " ألف"],
  ];
  for (const [v, en, ar] of units) {
    if (abs >= v) {
      const x = n / v;
      const s = x >= 100 ? x.toFixed(0) : x.toFixed(1).replace(/\.0$/, "");
      return locale === "ar" ? s + ar : s + en;
    }
  }
  return n.toLocaleString(locale === "ar" ? "ar-SA" : "en-US");
}

export function full(n: number | undefined, locale: Locale = "ar"): string {
  if (n === undefined) return "—";
  return n.toLocaleString(locale === "ar" ? "ar-SA-u-nu-latn" : "en-US");
}

export function date(ts: number | undefined, locale: Locale = "ar"): string {
  if (!ts) return "—";
  const ms = ts < 1e12 ? ts * 1000 : ts;
  return new Date(ms).toLocaleDateString(locale === "ar" ? "ar-SA-u-nu-latn-ca-gregory" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function timeAgo(ts: number | undefined, locale: Locale = "ar"): string {
  if (!ts) return "—";
  const ms = ts < 1e12 ? ts * 1000 : ts;
  const diff = (Date.now() - ms) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
    [Infinity, "year"],
  ];
  let v = diff;
  for (const [div, unit] of steps) {
    if (Math.abs(v) < div) return rtf.format(-Math.round(v), unit);
    v /= div;
  }
  return "—";
}

export function duration(sec: number | undefined): string {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function percent(x: number, digits = 1): string {
  if (!Number.isFinite(x)) return "—";
  return `${(x * 100).toFixed(digits)}%`;
}

export function normalizeUsername(raw: string): string {
  let s = decodeURIComponent(raw || "").trim();
  const urlMatch = s.match(/(?:tiktok\.com\/@|instagram\.com\/)([A-Za-z0-9._]+)/i);
  if (urlMatch) s = urlMatch[1];
  return s.replace(/^@+/, "").replace(/[^A-Za-z0-9._]/g, "").slice(0, 30).toLowerCase();
}

export function isValidUsername(u: string): boolean {
  return /^[a-z0-9._]{1,30}$/.test(u) && !/^\.+$/.test(u);
}

export function extractHashtags(text: string): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(/#([\p{L}\p{N}_]+)/gu)) out.add(m[1].toLowerCase());
  return [...out];
}
