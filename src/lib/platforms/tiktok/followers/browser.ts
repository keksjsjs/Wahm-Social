import "server-only";
/**
 * Fetch TikTok followers/following by driving Chromium with TIKTOK_COOKIE.
 * TikTok's own page JS signs fetch()/XHR; we call /api/user/list from inside
 * the page and read the JSON — we never generate X-Bogus ourselves.
 */
import type { Connection } from "../../types";
import { cookieValue, cookiesForBrowser, hasTikTokSession, CHROME_UA } from "../session";

export type BrowserListResult = {
  items: Connection[];
  region?: string;
  note: string;
  status?: number;
  bodyLen?: number;
};

let lastBrowserTry: { at: string; note: string; status?: number; bodyLen?: number; n?: number } | null = null;
export const lastBrowserListTry = () => lastBrowserTry;

async function launchBrowser() {
  try {
    const puppeteer = await import("puppeteer-core");
    const fs = await import("fs");
    for (const bin of ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", process.env.CHROME_PATH].filter(Boolean) as string[]) {
      if (fs.existsSync(bin)) {
        return puppeteer.launch({
          executablePath: bin,
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-blink-features=AutomationControlled", "--lang=en-US"],
        });
      }
    }
  } catch {
    /* fall through */
  }
  const chromium = await import("@sparticuz/chromium");
  const puppeteer = await import("puppeteer-core");
  return puppeteer.launch({
    args: [...chromium.default.args, "--lang=en-US", "--disable-blink-features=AutomationControlled", "--no-sandbox"],
    defaultViewport: { width: 1280, height: 800 },
    executablePath: await chromium.default.executablePath(),
    headless: true,
  });
}

function parseList(j: { userList?: { user?: Record<string, unknown> }[] }): Connection[] {
  return (j.userList ?? [])
    .map((x) => x.user ?? (x as unknown as Record<string, unknown>))
    .filter((u) => u?.uniqueId || u?.unique_id)
    .map((u) => ({
      username: String(u.uniqueId || u.unique_id),
      displayName: String(u.nickname || u.uniqueId || u.unique_id),
      avatarUrl: String(u.avatarThumb || u.avatarMedium || ""),
      verified: Boolean(u.verified),
    }));
}

export async function browserList(username: string, kind: "followers" | "following"): Promise<BrowserListResult> {
  if (!hasTikTokSession()) {
    lastBrowserTry = { at: new Date().toISOString(), note: "not_configured" };
    return { items: [], note: "not_configured" };
  }
  const cookies = cookiesForBrowser();
  if (!cookies.length) {
    lastBrowserTry = { at: new Date().toISOString(), note: "not_configured" };
    return { items: [], note: "not_configured" };
  }

  let browser: Awaited<ReturnType<typeof launchBrowser>> | null = null;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setUserAgent(CHROME_UA);
    await page.setExtraHTTPHeaders({ "accept-language": "en-US,en;q=0.9" });
    await page.setCookie(...cookies);

    let region: string | undefined;
    const captureBox: { current: { status: number; bodyLen: number; items: Connection[] } | null } = { current: null };

    page.on("response", async (res) => {
      try {
        const url = res.url();
        if (!url.includes("/api/user/list")) return;
        const text = await res.text();
        if (!text.trimStart().startsWith("{")) return;
        const j = JSON.parse(text);
        const items = parseList(j).filter((c) => c.username.toLowerCase() !== username.toLowerCase());
        const prev = captureBox.current;
        if (items.length && text.length > 500 && (!prev || text.length > (prev.bodyLen || 0))) {
          captureBox.current = { status: res.status(), bodyLen: text.length, items };
        }
      } catch {
        /* ignore intercept errors */
      }
    });

    await page.goto(`https://www.tiktok.com/@${encodeURIComponent(username)}?lang=en`, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    // Give TikTok's signer scripts a moment to boot.
    await new Promise((r) => setTimeout(r, 2500));

    const meta = await page.evaluate(() => {
      const s = document.getElementById("__UNIVERSAL_DATA_FOR_REHYDRATION__");
      if (!s?.textContent) return { secUid: "", region: undefined as string | undefined, challenge: /captcha|challenge|verify/i.test(document.body?.innerText || "") };
      try {
        const u = JSON.parse(s.textContent).__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.user;
        const r = u?.region;
        return {
          secUid: String(u?.secUid || ""),
          region: typeof r === "string" && /^[A-Za-z]{2}$/.test(r) ? r.toUpperCase() : undefined,
          challenge: false,
        };
      } catch {
        return { secUid: "", region: undefined, challenge: true };
      }
    });
    region = meta.region;
    if (meta.challenge && !meta.secUid) {
      lastBrowserTry = { at: new Date().toISOString(), note: "browser_challenge" };
      return { items: [], region, note: "browser_challenge" };
    }

    const scene = kind === "followers" ? "67" : "21";
    const msToken = cookieValue("msToken");
    const verifyFp = cookieValue("s_v_web_id");
    const deviceId = cookieValue("ttwid") || verifyFp;
    const storeRegion = (cookieValue("store-country-code") || "US").toUpperCase();

    // Call the list API from inside the page so TikTok's own fetch wrapper can sign it.
    if (meta.secUid) {
      const inPage = await page.evaluate(
        async ({ secUid, scene, msToken, verifyFp, deviceId, region }) => {
          const qs = new URLSearchParams({
            aid: "1988",
            app_language: "en",
            app_name: "tiktok_web",
            browser_language: "en-US",
            browser_name: "Mozilla",
            browser_online: "true",
            browser_platform: "Win32",
            channel: "tiktok_web",
            cookie_enabled: "true",
            count: "30",
            device_platform: "web_pc",
            from_page: "user",
            maxCursor: "0",
            minCursor: "0",
            os: "windows",
            region,
            scene,
            secUid,
            webcast_language: "en",
          });
          if (msToken) qs.set("msToken", msToken);
          if (deviceId) qs.set("device_id", deviceId);
          if (verifyFp) qs.set("verifyFp", verifyFp);
          try {
            const res = await fetch(`/api/user/list/?${qs.toString()}`, {
              credentials: "include",
              headers: { accept: "application/json" },
            });
            const text = await res.text();
            return { status: res.status, text };
          } catch (e) {
            return { status: 0, text: "", err: String(e).slice(0, 80) };
          }
        },
        { secUid: meta.secUid, scene, msToken, verifyFp, deviceId, region: storeRegion },
      );
      if (inPage.text?.trimStart().startsWith("{")) {
        try {
          const j = JSON.parse(inPage.text);
          const items = parseList(j).filter((c) => c.username.toLowerCase() !== username.toLowerCase());
          if (items.length && inPage.text.length > 500) {
            captureBox.current = { status: inPage.status, bodyLen: inPage.text.length, items };
          } else if (!captureBox.current) {
            const note = String(j?.status_msg || j?.statusMsg || (items.length ? "ok" : "empty_json")).slice(0, 60);
            console.warn(`[tiktok-followers] browser inpage status=${inPage.status} body=${inPage.text.length} note=${note}`);
          }
        } catch {
          /* ignore */
        }
      } else {
        console.warn(`[tiktok-followers] browser inpage status=${inPage.status} body=${(inPage.text || "").length} err=${(inPage as { err?: string }).err || ""}`);
      }
    }

    // Fallback: click the Followers/Following count (TikTok UI triggers a signed list fetch).
    if (!captureBox.current) {
      const sel = kind === "followers" ? '[data-e2e="followers-count"]' : '[data-e2e="following-count"]';
      await page.evaluate((s, kind) => {
        const el = document.querySelector(s) as HTMLElement | null;
        if (el) {
          el.click();
          return "e2e";
        }
        const label = kind === "followers" ? /followers/i : /following/i;
        for (const n of document.querySelectorAll("strong, span, a, div, button")) {
          const t = n.textContent || "";
          if (label.test(t) && /\d/.test(t)) {
            (n as HTMLElement).click();
            return "text";
          }
        }
        return null;
      }, sel, kind);
      for (let i = 0; i < 20 && !captureBox.current; i++) await new Promise((r) => setTimeout(r, 500));
    }

    const got = captureBox.current;
    if (got?.items.length) {
      lastBrowserTry = { at: new Date().toISOString(), note: "ok", status: got.status, bodyLen: got.bodyLen, n: got.items.length };
      console.warn(`[tiktok-followers] browser ok status=${got.status} body=${got.bodyLen} n=${got.items.length}`);
      return { items: got.items, region, note: "ok", status: got.status, bodyLen: got.bodyLen };
    }
    lastBrowserTry = { at: new Date().toISOString(), note: meta.secUid ? "browser_empty" : "browser_no_secuid", status: got?.status, bodyLen: got?.bodyLen };
    return { items: [], region, note: meta.secUid ? "browser_empty" : "browser_no_secuid", status: got?.status, bodyLen: got?.bodyLen };
  } catch (e) {
    const note = (e as Error).message?.slice(0, 60) || "browser_error";
    lastBrowserTry = { at: new Date().toISOString(), note };
    console.warn(`[tiktok-followers] browser fail: ${note}`);
    return { items: [], note };
  } finally {
    try {
      await browser?.close();
    } catch {
      /* ignore */
    }
  }
}
