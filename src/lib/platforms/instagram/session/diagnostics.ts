import "server-only";
/** Last Instagram lookup attempts (statuses/notes only — never secrets), for /api/health?ig=1. */
import type { IgAttempt } from "./api";

let last: { username: string; at: string; attempts: IgAttempt[]; result: string } | null = null;

export function recordIg(username: string, attempts: IgAttempt[], result: string) {
  last = { username, at: new Date().toISOString(), attempts, result };
  if (result !== "ok") console.warn(`[instagram] @${username} ${result}: ${attempts.map((a) => `${a.client}@${a.host}=${a.status}/${a.outcome}${a.note ? `(${a.note})` : ""}`).join(", ")}`);
}

export const lastIgLookup = () => last;
