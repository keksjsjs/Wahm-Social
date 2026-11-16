/**
 * Load admin settings once at startup and refresh them every minute, so API routes
 * (proxy, sessions, toggles) see panel edits even without a page render.
 */
import { refreshSettings } from "./lib/site/store";

void refreshSettings();
const g = globalThis as unknown as { __frostlyTimer?: NodeJS.Timeout };
if (!g.__frostlyTimer) {
  g.__frostlyTimer = setInterval(() => void refreshSettings(), 60_000);
  g.__frostlyTimer.unref?.();
}
