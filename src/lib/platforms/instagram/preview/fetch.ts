import "server-only";
/** Fetch Instagram's public link-preview HTML (served to link-unfurling clients). */
import { httpGet } from "../../../server/http";
import { PlatformError } from "../../types";

const PREVIEW_UAS = [
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  "Twitterbot/1.0",
  "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
];

export async function fetchPreview(path: string, attempt = 0): Promise<string> {
  const res = await httpGet(`https://www.instagram.com${path}`, {
    headers: { "user-agent": PREVIEW_UAS[attempt % PREVIEW_UAS.length], accept: "text/html" },
    retries: 0,
    timeoutMs: 10000,
  });
  if (res.status === 404) throw new PlatformError("not_found", "Not found on Instagram", 404);
  // Rate-limited previews are redirected to the login page — that is "blocked", never "not found".
  if (/\/accounts\/login|\/challenge\//.test(res.url)) throw new PlatformError("blocked", "Instagram asked for a login (rate limited)", 503);
  if (res.status !== 200) throw new PlatformError("blocked", `Instagram preview unavailable (HTTP ${res.status})`, 503);
  return res.text;
}
