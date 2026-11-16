import "server-only";
/**
 * Fetch TikTok followers/following by driving a real Chromium with the server's
 * TIKTOK_COOKIE. TikTok's own page JS adds the request signature we refuse to
 * reverse-engineer; we only intercept the JSON response.
 */
import type { Connection } from "../../types";
import { cookiesForBrowser, hasTikTokSession, CHROME_UA } from "../session";

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
  // Prefer system Chrome (local/dev); fall back to @sparticuz/chromium on Render.
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
    args: [...chromium.default.args, "--lang=en-US", "--disable-blink-features=AutomationControlled"],
    defaultViewport: chromium.default.defaultViewport,
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
        // Prefer the largest payload (real list ~50KB); ignore tiny error JSON.
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
    await new Promise((r) => setTimeout(r, 2000));

    region = await page.evaluate(() => {
      const s = document.getElementById("__UNIVERSAL_DATA_FOR_REHYDRATION__");
      if (!s?.textContent) return undefined;
      try {
        const u = JSON.parse(s.textContent).__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.user;
        const r = u?.region;
        return typeof r === "string" && /^[A-Za-z]{2}$/.test(r) ? r.toUpperCase() : undefined;
      } catch {
        return undefined;
      }
    });

    const sel = kind === "followers" ? '[data-e2e="followers-count"]' : '[data-e2e="following-count"]';
    const clicked = await page.evaluate((s, kind) => {
      const el = document.querySelector(s) as HTMLElement | null;
      if (el) { el.click(); return "e2e"; }
      // Fallback: click the count next to the Followers/Following label.
      const label = kind === "followers" ? /followers/i : /following/i;
      for (const n of document.querySelectorAll("span, strong, a, div")) {
        const t = n.textContent || "";
        if (label.test(t) && /\d/.test(t)) { (n as HTMLElement).click(); return "text"; }
      }
      return null;
    }, sel, kind);
    for (let i = 0; i < 24 && !captureBox.current; i++) await new Promise((r) => setTimeout(r, 500));
    const got = captureBox.current;
    if (!got) console.warn(`[tiktok-followers] browser click=${clicked} no list yet`);

    if (got?.items.length) {
      lastBrowserTry = { at: new Date().toISOString(), note: "ok", status: got.status, bodyLen: got.bodyLen, n: got.items.length };
      console.warn(`[tiktok-followers] browser ok status=${got.status} body=${got.bodyLen} n=${got.items.length}`);
      return { items: got.items, region, note: "ok", status: got.status, bodyLen: got.bodyLen };
    }
    lastBrowserTry = { at: new Date().toISOString(), note: "browser_empty", status: got?.status, bodyLen: got?.bodyLen };
    return { items: [], region, note: "browser_empty", status: got?.status, bodyLen: got?.bodyLen };
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
