/**
 * Process-wide settings snapshot on globalThis (shared by every server bundle, incl. instrumentation).
 * Safe to read synchronously anywhere on the server; defaults until the first load completes.
 */
import { DEFAULT_SETTINGS } from "./defaults";
import type { SiteSettings } from "./types";

export interface Snapshot {
  settings: SiteSettings;
  secrets: Record<string, string>;
  loadedAt: number;
  error: string;
  rev: number;
}

const g = globalThis as unknown as { __frostlySite?: Snapshot };

export function snapshot(): Snapshot {
  return (g.__frostlySite ??= { settings: DEFAULT_SETTINGS, secrets: {}, loadedAt: 0, error: "", rev: 0 });
}

export function setSnapshot(next: Partial<Snapshot>) {
  const cur = snapshot();
  g.__frostlySite = { ...cur, ...next, rev: cur.rev + 1 };
}

/** Current settings (sync). */
export const siteNow = (): SiteSettings => snapshot().settings;
