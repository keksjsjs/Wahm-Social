export type Theme = "light" | "dark";
export const THEME_COOKIE = "frostly_theme";

/** Inline, render-blocking script that resolves the theme before first paint (no flash). */
export const themeBootScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark)/);var t=m?m[1]:(localStorage.getItem('${THEME_COOKIE}')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}})();`;
