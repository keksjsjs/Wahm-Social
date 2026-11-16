import "server-only";
/** Client-credentials token for the official TikTok Research API (cached until expiry). */
import { tiktokResearch } from "../../../env";
import { PlatformError } from "../../types";

let cached: { token: string; exp: number } | null = null;

export async function researchToken(): Promise<string> {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  if (!tiktokResearch.enabled) throw new PlatformError("blocked", "TikTok Research API is not configured", 503);
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_key: tiktokResearch.clientKey, client_secret: tiktokResearch.clientSecret, grant_type: "client_credentials" }),
  });
  const j = (await res.json()) as { access_token?: string; expires_in?: number; error_description?: string };
  if (!res.ok || !j.access_token) throw new PlatformError("upstream_error", j.error_description ?? "TikTok token error", 502);
  cached = { token: j.access_token, exp: Date.now() + (j.expires_in ?? 7200) * 1000 };
  return cached.token;
}
