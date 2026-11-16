import type { Bi } from "../site/types";

const MAX = 4000;
export const str = (f: FormData, k: string, max = MAX) => String(f.get(k) ?? "").slice(0, max).trim();
export const bi = (f: FormData, k: string, max = MAX): Bi => ({ ar: str(f, `${k}_ar`, max), en: str(f, `${k}_en`, max) });
/** Checkbox that was rendered (hidden `__present`) — unchecked means false. */
export const bool = (f: FormData, k: string, prev: boolean) => (f.get(`${k}__present`) ? f.get(k) === "on" : prev);
export const num = (f: FormData, k: string, prev: number) => {
  const n = Number(str(f, k, 20));
  return Number.isFinite(n) && n >= 0 && n < 100000 ? Math.round(n * 100) / 100 : prev;
};
export const lines = (f: FormData, k: string) =>
  [...new Set(str(f, k, 60_000).split(/\r?\n|,(?=\s)/).map((x) => x.trim()).filter(Boolean))].slice(0, 1000);
