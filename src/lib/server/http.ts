/**
 * Small fetch wrapper used by every scraper: timeouts, retries with backoff,
 * realistic browser headers and structured errors.
 */
import { PlatformError } from "../platforms/types";
import { recordRelayTry, rewriteViaRelay, shouldRelay } from "./relay";

export const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
export const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";

export interface FetchOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
  method?: string;
  body?: string;
  /** Route through SCRAPER_PROXY when it is configured (Instagram blocks shared datacenter IPs). */
  proxy?: boolean;
}

export interface FetchResult {
  status: number;
  text: string;
  headers: Headers;
  url: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function httpGet(url: string, opts: FetchOptions = {}): Promise<FetchResult> {
  const { timeoutMs = 12000 } = opts;
  // One extra attempt per spare proxy so a dead proxy in SCRAPER_PROXY fails over.
  const spare = opts.proxy ? Math.max(0, proxyList().length - 1) : 0;
  const retries = (opts.retries ?? 1) + spare;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const useRelay = shouldRelay(url, opts);
      const fetchUrl = useRelay ? rewriteViaRelay(url) : url;
      const doFetch = useRelay ? null : opts.proxy ? await proxiedFetch() : null;
      const res = await (doFetch ?? fetch)(fetchUrl, {
        method: opts.method ?? "GET",
        body: opts.body,
        headers: {
          "user-agent": DESKTOP_UA,
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7",
          "accept-language": "en-US,en;q=0.9,ar;q=0.8",
          ...opts.headers,
        },
        redirect: "follow",
        signal: ctrl.signal,
        cache: "no-store",
      } as RequestInit);
      if (doFetch && res.status === 407 && attempt < retries && failoverProxy()) continue;
      const text = await res.text();
      if (res.status >= 500 && attempt < retries) {
        await sleep(400 * (attempt + 1));
        continue;
      }
      if (useRelay) recordRelayTry(url, res.status, res.status < 400);
      // When relayed, res.url is the Worker URL — keep the original target for callers.
      return { status: res.status, text, headers: res.headers, url: useRelay ? url : res.url };
    } catch (e) {
      lastErr = e;
      if (opts.proxy && !shouldRelay(url, opts) && (e as Error)?.name !== "AbortError") failoverProxy();
      if (attempt < retries) await sleep(400 * (attempt + 1));
    } finally {
      clearTimeout(t);
    }
  }
  throw new PlatformError("upstream_error", `Upstream request failed: ${String((lastErr as Error)?.message ?? lastErr)}`, 502);
}

/** Extract a JSON payload embedded in a <script id="..."> tag. */
export function extractScriptJson<T = unknown>(html: string, id: string): T | null {
  const re = new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)</script>`);
  const m = html.match(re);
  if (!m) return null;
  try {
    return JSON.parse(m[1]) as T;
  } catch {
    return null;
  }
}

/** Collect "name=value" pairs from Set-Cookie headers into a Cookie header string. */
export function cookiesFrom(headers: Headers): string {
  const anyHeaders = headers as unknown as { getSetCookie?: () => string[] };
  const list = anyHeaders.getSetCookie ? anyHeaders.getSetCookie() : (headers.get("set-cookie") ?? "").split(/,(?=\s*\w+=)/);
  return list
    .map((c) => c.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

export function looksLikeBotWall(html: string): boolean {
  // Real TikTok SSR pages mention a "captcha" API domain in the first 4KB
  // (`{"kind":"m","captcha":""}`) and also embed this script. Never treat those as a wall.
  if (/__UNIVERSAL_DATA_FOR_REHYDRATION__/.test(html)) return false;
  const head = html.slice(0, 4000);
  return /Just a moment\.\.\.|challenge-platform|Please wait\.\.\.|tiktok-verify-page|_wafchallengeid/i.test(head);
}

/**
 * SCRAPER_PROXY may hold one proxy or several separated by commas / whitespace / newlines.
 * The "active" one is used first; on a connection error or HTTP 407 we fail over to the next
 * and keep using whichever answered last.
 */
export function proxyList(raw = process.env.SCRAPER_PROXY ?? ""): string[] {
  return raw.split(/[\s,]+/).map((x) => x.trim()).filter(Boolean);
}
const pg = globalThis as unknown as { __frostlyProxyIdx?: number; __frostlyProxyKey?: string };
export function activeProxyIndex(): number {
  const list = proxyList();
  const key = list.join(",");
  if (pg.__frostlyProxyKey !== key) {
    pg.__frostlyProxyKey = key;
    pg.__frostlyProxyIdx = 0;
  }
  return list.length ? (pg.__frostlyProxyIdx ?? 0) % list.length : 0;
}
export function activeProxy(): string {
  const list = proxyList();
  return list.length ? list[activeProxyIndex()] : "";
}
function failoverProxy(): boolean {
  const list = proxyList();
  if (list.length < 2) return false;
  pg.__frostlyProxyIdx = (activeProxyIndex() + 1) % list.length;
  console.warn(`[proxy] failover -> #${pg.__frostlyProxyIdx}`);
  return true;
}
/** Parse proxy credentials for Chromium (--proxy-server + page.authenticate). */
export function proxyForBrowser(raw = activeProxy()): { server: string; username?: string; password?: string } | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return {
      server: `${u.protocol}//${u.hostname}:${u.port || (u.protocol === "https:" ? "443" : "80")}`,
      username: u.username ? decodeURIComponent(u.username) : undefined,
      password: u.password ? decodeURIComponent(u.password) : undefined,
    };
  } catch {
    return null;
  }
}

const proxyFetchCache = new Map<string, typeof fetch>();
export async function proxiedFetch(override?: string): Promise<typeof fetch | null> {
  const url = override ? proxyList(override)[0] : activeProxy();
  if (!url) return null;
  const hit = proxyFetchCache.get(url);
  if (hit) return hit;
  const { ProxyAgent, fetch: ufetch } = await import("undici");
  const dispatcher = new ProxyAgent(url);
  const fn = ((input: string, init?: RequestInit) =>
    ufetch(input, { ...(init as object), dispatcher } as never)) as unknown as typeof fetch;
  if (proxyFetchCache.size > 8) proxyFetchCache.clear();
  proxyFetchCache.set(url, fn);
  return fn;
}
