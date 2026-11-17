/**
 * In-memory ring buffer of recent server-side problems for the admin "logs" page.
 * Messages are scrubbed: URL credentials, cookie/session/token values and long opaque strings are removed.
 */
export interface LogRow {
  at: string;
  scope: string;
  message: string;
  count: number;
}

const g = globalThis as unknown as { __frostlyErrors?: LogRow[] };
const rows = () => (g.__frostlyErrors ??= []);
const MAX = 200;

export function scrub(msg: string): string {
  return msg
    .replace(/\/\/[^\s/@]+@/g, "//***@")
    .replace(/\b(sessionid|sessionid_ss|sid_tt|sid_guard|msToken|tt_csrf_token|ttwid|csrftoken|ds_user_id|mid|datr|cookie|password|pass|token|secret|key)\s*[=:]\s*[^\s;,&"]+/gi, "$1=***")
    .replace(/[A-Za-z0-9%_\-]{40,}/g, "…")
    .slice(0, 300);
}

export function logError(scope: string, message: string) {
  const clean = scrub(message);
  const list = rows();
  const head = list[0];
  if (head && head.scope === scope && head.message === clean) {
    head.count++;
    head.at = new Date().toISOString();
    return;
  }
  list.unshift({ at: new Date().toISOString(), scope, message: clean, count: 1 });
  if (list.length > MAX) list.length = MAX;
}

export const recentErrors = (n = 100) => rows().slice(0, n);
export const clearErrors = () => {
  rows().length = 0;
};
