import type { ThemeSettings } from "./types";

type RGB = [number, number, number];
const hex = (h: string): RGB | null => {
  const m = /^#?([0-9a-f]{6})$/i.exec(h.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a: RGB, b: RGB, t: number): RGB => a.map((v, i) => Math.round(v + (b[i] - v) * t)) as RGB;
const css = (c: RGB) => c.join(" ");

/** CSS variables overriding the accent palette (globals.css) from two admin-picked colours. */
export function accentCss(t: ThemeSettings): string {
  const p = hex(t.accentPrimary);
  if (!p) return "";
  const s = hex(t.accentSecondary) ?? mix(p, [0, 0, 0], 0.25);
  const W: RGB = [255, 255, 255];
  const vars = {
    "--accent-200": css(mix(p, W, 0.75)),
    "--accent-300": css(mix(p, W, 0.5)),
    "--accent-400": css(mix(p, W, 0.25)),
    "--accent-500": css(p),
    "--accent-600": css(mix(p, [0, 0, 0], 0.15)),
    "--accent-700": css(s),
  };
  const body = Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
  return `:root,.dark{${body}}`;
}

export const isHexColor = (v: string) => /^#[0-9a-f]{6}$/i.test(v);
