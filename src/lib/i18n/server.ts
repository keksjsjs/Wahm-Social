import { cookies, headers } from "next/headers";
import { dictFor, isLocale, LOCALE_COOKIE, type Locale } from "./index";

/** Resolve locale from cookie, then Accept-Language, defaulting to Arabic. */
export function getLocale(): Locale {
  const c = cookies().get(LOCALE_COOKIE)?.value;
  if (isLocale(c)) return c;
  const al = headers().get("accept-language") ?? "";
  return /^en/i.test(al) && !/ar/i.test(al) ? "en" : "ar";
}

export function getDict() {
  const locale = getLocale();
  return { locale, t: dictFor(locale) };
}
