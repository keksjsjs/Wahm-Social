import "server-only";
/**
 * Optional countik.com hints: account language and recent video ids
 * used only to look up a video region (never invents a country).
 * Requests go through RELAY_URL when set, otherwise SCRAPER_PROXY.
 */
import { httpGet } from "../../server/http";
import { parseJsonBody, thirdPartyBlocked } from "./fallback-http";
import { languageFromCountik, videoIdsFromAnalyze } from "./countik-parse";

export type CountikNote = "ok" | "countik_blocked" | "countik_empty" | "countik_error";

export interface CountikTry {
  at: string;
  endpoint: string;
  note: CountikNote;
  status?: number;
}

let lastTry: CountikTry | null = null;
export const countikTry = () => lastTry;

function record(endpoint: string, note: CountikNote, status?: number) {
  lastTry = { at: new Date().toISOString(), endpoint, note, status };
}

const HEADERS = {
  accept: "application/json, text/plain, */*",
  referer: "https://countik.com/",
};

async function countikGet(path: string, endpoint: string): Promise<{ ok: true; data: unknown } | { ok: false; note: CountikNote }> {
  try {
    const res = await httpGet(`https://countik.com${path}`, {
      proxy: true,
      retries: 0,
      timeoutMs: 12000,
      headers: HEADERS,
    });
    if (thirdPartyBlocked(res.status, res.text, res.headers) || res.status === 403 || res.status === 429) {
      record(endpoint, "countik_blocked", res.status);
      return { ok: false, note: "countik_blocked" };
    }
    if (res.status >= 400) {
      record(endpoint, "countik_error", res.status);
      return { ok: false, note: "countik_error" };
    }
    const json = parseJsonBody(res.text);
    if (!json) {
      record(endpoint, "countik_blocked", res.status);
      return { ok: false, note: "countik_blocked" };
    }
    record(endpoint, "ok", res.status);
    return { ok: true, data: json };
  } catch {
    record(endpoint, "countik_error");
    return { ok: false, note: "countik_error" };
  }
}

export async function countikLanguage(secUid: string): Promise<string | undefined> {
  if (!secUid) return undefined;
  const r = await countikGet(`/api/userinfo?sec_user_id=${encodeURIComponent(secUid)}`, "userinfo");
  if (!r.ok) return undefined;
  const lang = languageFromCountik(r.data);
  if (!lang) record("userinfo", "countik_empty");
  return lang;
}

export async function countikVideoIds(secUid: string): Promise<string[]> {
  if (!secUid) return [];
  const r = await countikGet(`/api/analyze?sec_user_id=${encodeURIComponent(secUid)}`, "analyze");
  if (!r.ok) return [];
  const ids = videoIdsFromAnalyze(r.data);
  if (!ids.length) record("analyze", "countik_empty");
  return ids;
}
