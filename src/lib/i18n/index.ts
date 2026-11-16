import { ar, type Dict } from "./ar";
import { en } from "./en";
import type { Locale } from "../format";

export type { Dict, Locale };
export const LOCALES: Locale[] = ["ar", "en"];
export const LOCALE_COOKIE = "wahm_lang";
const dicts: Record<Locale, Dict> = { ar, en };

export const dictFor = (l: Locale): Dict => dicts[l] ?? ar;
export const dirFor = (l: Locale) => (l === "ar" ? "rtl" : "ltr");
export const isLocale = (v: unknown): v is Locale => v === "ar" || v === "en";

export function interpolate(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
