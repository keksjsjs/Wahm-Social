"use client";

import { createContext, useContext } from "react";
import type { Dict, Locale } from "@/lib/i18n";
import { DEFAULT_PUBLIC_SITE, type PublicSite } from "@/lib/site/publicFlags";

interface Ctx {
  locale: Locale;
  t: Dict;
  site: PublicSite;
}

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ locale, t, site, children }: { locale: Locale; t: Dict; site?: PublicSite; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, t, site: site ?? DEFAULT_PUBLIC_SITE }}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const c = useContext(I18nContext);
  if (!c) throw new Error("useI18n must be used inside <I18nProvider>");
  return c;
}

/** Admin-controlled public switches (enabled platforms, tabs, prices…). */
export const useSite = (): PublicSite => useI18n().site;
