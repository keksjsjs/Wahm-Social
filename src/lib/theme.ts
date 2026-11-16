export type Theme = "light" | "dark";
export const THEME_COOKIE = "frostly_theme";

/**
 * Inline, render-blocking script that resolves the theme before first paint (no flash).
 * `fallback` is the admin default when the visitor has not picked one ("system" = OS preference).
 */
export function themeBoot(fallback: "system" | "light" | "dark" = "system") {
  const def = fallback === "system" ? "(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')" : `'${fallback}'`;
  return `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark)/);var t=m?m[1]:(localStorage.getItem('${THEME_COOKIE}')||${def});document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}})();`;
}

export const themeBootScript = themeBoot("system");
