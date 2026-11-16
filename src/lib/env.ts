/**
 * Centralised, typed access to environment variables.
 * Secrets are never exposed to the client — only NEXT_PUBLIC_* are.
 */
function read(name: string, fallback = ""): string {
  const v = process.env[name];
  return v === undefined || v === "" ? fallback : v;
}

export const env = {
  siteUrl: read("NEXT_PUBLIC_SITE_URL", read("RENDER_EXTERNAL_URL", "http://localhost:3000")).replace(/\/$/, ""),
  jwtSecret: read("JWT_SECRET", "wahm-dev-secret-change-me-please-0123456789"),
  adminEmails: read("ADMIN_EMAILS")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
  igSessionId: read("IG_SESSIONID"),
  igCsrfToken: read("IG_CSRFTOKEN"),
  igDsUserId: read("IG_DS_USER_ID"),
  igMid: read("IG_MID"),
  igDatr: read("IG_DATR"),
  scraperProxy: read("SCRAPER_PROXY"),
  stripeSecret: read("STRIPE_SECRET_KEY"),
  stripePriceMonthly: read("STRIPE_PRICE_PRO_MONTHLY"),
  stripePriceYearly: read("STRIPE_PRICE_PRO_YEARLY"),
  stripeWebhookSecret: read("STRIPE_WEBHOOK_SECRET"),
  demoMode: read("DEMO_MODE", "auto") as "auto" | "on" | "off",
  dataDir: read("DATA_DIR", "./data"),
  isProd: process.env.NODE_ENV === "production",
};

export const billingMode = (): "stripe" | "mock" => (env.stripeSecret ? "stripe" : "mock");

/** Official TikTok Research API credentials (https://developers.tiktok.com/products/research-api/). */
export const tiktokResearch = {
  clientKey: process.env.TIKTOK_CLIENT_KEY ?? "",
  clientSecret: process.env.TIKTOK_CLIENT_SECRET ?? "",
  get enabled() {
    return Boolean(this.clientKey && this.clientSecret);
  },
};
