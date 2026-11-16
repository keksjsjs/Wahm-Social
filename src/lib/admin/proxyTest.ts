import "server-only";
import { DESKTOP_UA, looksLikeBotWall, proxiedFetch } from "../server/http";
import { thirdPartyBlocked } from "../platforms/tiktok/fallback-http";

export function validateProxyUrl(v: string): string | null {
  try {
    const u = new URL(v);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "البروكسي لازم يبدأ بـ http:// أو https:// (SOCKS غير مدعوم حالياً)";
    if (!u.hostname || !u.port) return "اكتب الرابط كامل مع البورت: http://user:pass@host:port";
    return null;
  } catch {
    return "رابط البروكسي غير صالح";
  }
}

const TARGETS: [string, string][] = [
  ["tiktok.com", "https://www.tiktok.com/@tiktok"],
  ["tikwm.com", "https://www.tikwm.com/api/user/info?unique_id=tiktok"],
  ["countik.com", "https://countik.com/"],
];

/** Fetch a few targets through the proxy (or directly when none is set) and describe each result. */
export async function runProxyTest(candidate?: string): Promise<string> {
  const using = candidate ?? process.env.SCRAPER_PROXY ?? "";
  const f = (using ? await proxiedFetch(using) : null) ?? fetch;
  const lines = [using ? `الاختبار عبر البروكسي${candidate ? " (الرابط اللي كتبته)" : " (المحفوظ)"}:` : "ما فيه بروكسي — الاختبار مباشر من السيرفر:"];
  for (const [label, url] of TARGETS) {
    const t0 = Date.now();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12_000);
    try {
      const res = await f(url, { headers: { "user-agent": DESKTOP_UA, accept: "text/html,application/json;q=0.9,*/*;q=0.8" }, signal: ctrl.signal, cache: "no-store" } as RequestInit);
      const text = await res.text();
      // tiktok.com is an HTML page (only a challenge/WAF page counts as blocked); tikwm/countik must return JSON.
      const blocked =
        label === "tiktok.com"
          ? looksLikeBotWall(text) || /_wafchallengeid|tiktok-verify-page|captcha/i.test(text.slice(0, 20000)) || res.status === 403
          : label === "tikwm.com"
            ? thirdPartyBlocked(res.status, text, res.headers) || res.status === 403
            : res.status === 403 || looksLikeBotWall(text);
      const verdict = res.status >= 200 && res.status < 400 && !blocked ? "✅ يشتغل" : blocked ? "⛔ محجوب (Cloudflare/تحقق)" : "⚠️";
      lines.push(`• ${label}: HTTP ${res.status} ${verdict} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    } catch (e) {
      lines.push(`• ${label}: ❌ فشل الاتصال (${String((e as Error).name === "AbortError" ? "timeout" : (e as Error).message).slice(0, 80)})`);
    } finally {
      clearTimeout(timer);
    }
  }
  return lines.join("\n");
}
