import type { Dict, Locale } from "../i18n";
import type { Bi, SiteSettings } from "./types";

const pick = (b: Bi, l: Locale, fallback: string) => (b[l] || "").trim() || fallback;

/** Overlay admin-edited copy onto the static dictionary. */
export function applyTextOverrides(t: Dict, l: Locale, s: SiteSettings): Dict {
  const x = s.texts;
  return {
    ...t,
    brand: pick(s.brand.siteName, l, t.brand),
    tagline: pick(s.brand.tagline, l, t.tagline),
    hero: {
      ...t.hero,
      badge: pick(x.heroBadge, l, t.hero.badge),
      title1: pick(x.heroTitle1, l, t.hero.title1),
      title2: pick(x.heroTitle2, l, t.hero.title2),
      subtitle: pick(x.heroSubtitle, l, t.hero.subtitle),
    },
    footer: {
      ...t.footer,
      disclaimer: pick(x.footerDisclaimer, l, t.footer.disclaimer),
      rights: pick(x.footerRights, l, t.footer.rights),
    },
  };
}
