import "server-only";
/**
 * JSON GET against Instagram's web API with classification of every answer.
 * Instagram replies to blocked calls with HTML 404s, 302s to /accounts/login,
 * or JSON {"status":"fail","message":"..."} — none of those mean "not found".
 */
import { httpGet } from "../../../server/http";
import { igHeaders, type IgClient } from "./cookies";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type IgAttempt = { client: IgClient; host: string; status: number; outcome: "ok" | "empty" | "blocked"; note?: string };
export type IgJson = { ok: true; json: any; attempt: IgAttempt } | { ok: false; attempt: IgAttempt };

export async function igJson(url: string, client: IgClient, referer?: string): Promise<IgJson> {
  const host = new URL(url).host;
  try {
    const res = await httpGet(url, { headers: igHeaders(client, referer), retries: 1, timeoutMs: 10000, proxy: true });
    const body = res.text.trimStart();
    if (!body.startsWith("{")) {
      const login = /accounts\/login/.test(res.url) || /"loginPage"|login_and_signup_page/.test(body.slice(0, 5000));
      return { ok: false, attempt: { client, host, status: res.status, outcome: "blocked", note: login ? "login_redirect" : "html_response" } };
    }
    const json = JSON.parse(body);
    if (json?.status === "fail" || json?.message === "login_required" || json?.require_login) {
      return { ok: false, attempt: { client, host, status: res.status, outcome: "blocked", note: String(json?.message ?? "fail").slice(0, 80) } };
    }
    return { ok: true, json, attempt: { client, host, status: res.status, outcome: "ok" } };
  } catch (e) {
    return { ok: false, attempt: { client, host, status: 0, outcome: "blocked", note: (e as Error).message?.slice(0, 80) } };
  }
}
