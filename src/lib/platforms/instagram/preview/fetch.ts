import "server-only";
/** Fetch Instagram's public link-preview HTML (served to link-unfurling clients). */
import { httpGet } from "../../../server/http";
import { PlatformError } from "../../types";

const PREVIEW_UA = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";

export async function fetchPreview(path: string): Promise<string> {
  const res = await httpGet(`https://www.instagram.com${path}`, {
    headers: { "user-agent": PREVIEW_UA, accept: "text/html" },
    retries: 1,
    timeoutMs: 10000,
  });
  if (res.status === 404) throw new PlatformError("not_found", "Not found on Instagram", 404);
  if (res.status !== 200) throw new PlatformError("blocked", `Instagram preview unavailable (HTTP ${res.status})`, 503);
  return res.text;
}
