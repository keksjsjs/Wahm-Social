/**
 * Session rotation for the TikTok / Instagram pools. The active index lives on globalThis so
 * every server bundle agrees; applyPools() writes the active entry onto process.env.
 */
import type { PoolKind } from "./types";

const g = globalThis as unknown as { __frostlyPoolIdx?: Partial<Record<PoolKind, number>>; __frostlyPoolRotations?: { at: string; kind: PoolKind; to: number }[] };

export function activeIndex(kind: PoolKind, size: number): number {
  if (!size) return 0;
  const idx = (g.__frostlyPoolIdx ??= {})[kind] ?? 0;
  return ((idx % size) + size) % size;
}

/** Advance to the next entry. Returns the new index. */
export function advance(kind: PoolKind, size: number): number {
  const map = (g.__frostlyPoolIdx ??= {});
  const next = size ? (activeIndex(kind, size) + 1) % size : 0;
  map[kind] = next;
  const log = (g.__frostlyPoolRotations ??= []);
  log.unshift({ at: new Date().toISOString(), kind, to: next });
  if (log.length > 20) log.pop();
  return next;
}

export const rotations = () => (g.__frostlyPoolRotations ?? []).slice();
