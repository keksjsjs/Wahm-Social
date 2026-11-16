/**
 * Pure mappers for countik.com JSON. Language + video-id hints only.
 * Never invents a country from an empty video list.
 */
import { isRecord } from "./fallback-http";

export function languageFromCountik(info: unknown): string | undefined {
  if (!isRecord(info)) return undefined;
  const lang = info.language;
  return typeof lang === "string" && lang.trim() ? lang.trim() : undefined;
}

export function videoIdsFromAnalyze(analyze: unknown): string[] {
  if (!isRecord(analyze) || !Array.isArray(analyze.videos)) return [];
  const ids: string[] = [];
  for (const v of analyze.videos) {
    if (!isRecord(v)) continue;
    const id = v.id ?? v.aweme_id ?? v.video_id;
    if (typeof id === "string" && /^\d{15,22}$/.test(id)) ids.push(id);
    else if (typeof id === "number" && Number.isFinite(id)) {
      const s = String(id);
      if (/^\d{15,22}$/.test(s)) ids.push(s);
    }
  }
  return ids;
}
