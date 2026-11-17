import "server-only";
/**
 * Diagnostics: load a public TikTok profile with the session cookie through each SCRAPER_PROXY entry.
 * Returns only statuses / sizes / booleans — never proxy credentials or cookie values.
 */
import { proxiedFetch, proxyList, activeProxyIndex } from "./http";
import { tiktokCookieHeader, CHROME_UA } from "../platforms/tiktok/session";
import { probeInstagram } from "../pools/probe";

type ProbeRow = {
  idx: number;
  host: string;
  ms: number;
  status?: number;
  bodyLen?: number;
  realProfile?: boolean;
  loggedIn?: boolean;
  waf?: boolean;
  error?: string;
  /** Anonymous Instagram public-profile JSON through the same proxy (status + verdict only). */
  instagram?: { status?: number; verdict: string; note?: string };
};
let cached: { at: number; rows: ProbeRow[] } | null = null;

export async function probeProxies(username = "khaby.lame"): Promise<{ at: string; active: number; rows: ProbeRow[] }> {
  if (cached && Date.now() - cached.at < 120_000) return { at: new Date(cached.at).toISOString(), active: activeProxyIndex(), rows: cached.rows };
  const list = proxyList();
  const cookie = tiktokCookieHeader();
  const rows: ProbeRow[] = [];
  for (let i = 0; i < list.length; i++) {
    let host = "?";
    try {
      host = new URL(list[i]).hostname.replace(/^(\d+\.\d+)\.\d+\.\d+$/, "$1.x.x");
    } catch { /* ignore */ }
    const t0 = Date.now();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15_000);
    try {
      const f = (await proxiedFetch(list[i]))!;
      const res = await f(`https://www.tiktok.com/@${encodeURIComponent(username)}?lang=en`, {
        headers: { "user-agent": CHROME_UA, accept: "text/html", "accept-language": "en-US,en;q=0.9", ...(cookie ? { cookie } : {}) },
        signal: ctrl.signal,
        cache: "no-store",
      } as RequestInit);
      const text = await res.text();
      const realProfile = text.includes("webapp.user-detail") && text.includes('"secUid"');
      const m = text.match(/"webapp\.app-context":\{[\s\S]{0,4000}?"user":\{[\s\S]{0,400}?"uid":"(\d+)"/);
      rows.push({
        idx: i,
        host,
        ms: Date.now() - t0,
        status: res.status,
        bodyLen: text.length,
        realProfile,
        loggedIn: Boolean(m && m[1] !== "0"),
        waf: !realProfile && /_wafchallengeid|tiktok-verify-page|captcha|slardar/i.test(text.slice(0, 20000)),
      });
      const ig = await probeInstagram(f).catch(() => null);
      if (ig) rows[rows.length - 1].instagram = { status: ig.status, verdict: ig.verdict, note: ig.note };
    } catch (e) {
      rows.push({ idx: i, host, ms: Date.now() - t0, error: String((e as Error).name === "AbortError" ? "timeout" : (e as Error).message).slice(0, 80) });
    } finally {
      clearTimeout(timer);
    }
  }
  cached = { at: Date.now(), rows };
  return { at: new Date().toISOString(), active: activeProxyIndex(), rows };
}
