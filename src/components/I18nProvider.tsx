"use client";

import { createContext, useContext } from "react";
import type { Dict, Locale } from "@/lib/i18n";

interface Ctx {
  locale: Locale;
  t: Dict;
}

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ locale, t, children }: Ctx & { children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const c = useContext(I18nContext);
  if (!c) throw new Error("useI18n must be used inside <I18nProvider>");
  return c;
}
