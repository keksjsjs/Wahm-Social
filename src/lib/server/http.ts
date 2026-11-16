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
  const { timeoutMs = 12000, retries = 1 } = opts;
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
  return /Just a moment\.\.\.|captcha|challenge-platform|Please wait\.\.\./i.test(html.slice(0, 4000));
}

let proxyFetch: { url: string; fn: typeof fetch } | null = null;
/**
 * fetch bound to SCRAPER_PROXY (http(s)://user:pass@host:port), or null when not configured.
 * Re-created whenever the proxy URL changes (it can be edited live from the admin panel).
 */
export async function proxiedFetch(override?: string): Promise<typeof fetch | null> {
  const url = override ?? process.env.SCRAPER_PROXY;
  if (!url) return null;
  if (!override && proxyFetch?.url === url) return proxyFetch.fn;
  const { ProxyAgent, fetch: ufetch } = await import("undici");
  const dispatcher = new ProxyAgent(url);
  const fn = ((input: string, init?: RequestInit) =>
    ufetch(input, { ...(init as object), dispatcher } as never)) as unknown as typeof fetch;
  if (!override) proxyFetch = { url, fn };
  return fn;
}
