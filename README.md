# Frostly · فروستلي

_TikTok & Instagram downloader, profile viewer, story viewer & analytics — by Wahm (@iwahm). Suggested domain: **frostly.store**._

Arabic-first SaaS for **public** TikTok & Instagram account insights: profile viewer, recent posts, watermark-free downloads, public story viewer, analytics, compare, watchlist and Pro plans.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind**, deployed as a single Render web service.

## Features
- Platform toggle (TikTok | Instagram), username or URL search
- SSR profile pages with OG images, JSON-LD (ProfilePage, VideoObject, FAQ, Breadcrumbs), sitemap & robots
- Post detail + no-watermark video / image / audio downloads (streamed through an allow-listed media proxy)
- Story viewer (Instagram public stories, needs `IG_SESSIONID`)
- Followers/following: per-account privacy gate (public / hidden / private). TikTok lists load via the official TikTok Research API when `TIKTOK_CLIENT_KEY`/`TIKTOK_CLIENT_SECRET` are set; otherwise counts + "open on TikTok". Instagram lists are login-only.
- Instagram: public link-preview fallback for profile name/avatar/counts and single posts when the web API is blocked
- Analytics: engagement rate, averages, posting frequency, best day/hour, top hashtags, earnings estimate, Frost score
- Pro: batch download, compare accounts, watchlist, CSV export, advanced analytics; Business: API keys
- Auth: email/password + JWT httpOnly cookie, magic-link stub; per-plan daily quotas; burst rate limiting
- Billing: mock mode by default; Stripe Checkout + signed webhook when keys are set
- Admin dashboard, AR/EN i18n with RTL, icy glassmorphism design with light ("sugar") and dark ("frost") themes

## Architecture
```
src/
  app/                 routes (pages + /api route handlers)
  components/          UI library (ui, layout, profile, post, analytics, download, compare, watchlist, pricing, auth, seo, content)
  lib/
    platforms/         adapters: tiktok/, instagram/ (pure parsers + I/O), demo.ts, index.ts (service w/ cache + fallback)
    server/            http, cache (LRU + stale-if-error), rateLimit, db (JSON store + repositories), auth, quota, media proxy
    i18n/              ar.ts / en.ts dictionaries
    seo/               metadata + JSON-LD builders
    content/           blog, FAQ, featured accounts, static pages, SEO tool pages
    analytics.ts       pure analytics + CSV
    plans.ts           plan catalogue & feature gates (single source of truth)
tests/                 node:test unit tests for parsers/analytics
```

### Data sources (public only)
| Platform | Data | Source |
|---|---|---|
| TikTok | Profile | `tiktok.com/@user` SSR JSON |
| TikTok | Recent posts | `tiktok.com/embed/@user` + per-video SSR JSON for stats |
| TikTok | Downloads | video page `playAddr` streamed with the page cookies |
| Instagram | Profile + 12 posts | `web_profile_info` public endpoint |
| Instagram | Single post | `/p/{code}/embed/captioned/` |
| Instagram | Stories | `reels_media` (requires `IG_SESSIONID` of a server-owned account; public accounts only) |

Instagram heavily rate-limits datacenter IPs. When blocked, `DEMO_MODE=auto` serves clearly-labelled demo data so the UI stays usable. For production reliability set `IG_SESSIONID` and/or `SCRAPER_PROXY`.

Private accounts, DMs, and follower lists are **never** bypassed.

## Env vars
See `.env.example`. Key ones: `JWT_SECRET`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAILS`, `IG_SESSIONID`, `STRIPE_*`, `DEMO_MODE`, `DATA_DIR`.

## Dev
```bash
npm install
npm run dev
npm test
```

## Deploy
Render Blueprint: `render.yaml`. Note: free instances have an ephemeral disk; attach a disk or migrate the repositories in `lib/server/db.ts` to Postgres for durable accounts.

## Code protection
- Code is split into many small modules (UI primitives, i18n sections, blog articles, platform parsers/adapters, connections providers).
- `productionBrowserSourceMaps: false` — no `.map` files ship.
- Client app chunks are obfuscated in production with `webpack-obfuscator` (string arrays, renamed identifiers). Disable with `OBFUSCATE=0`.
- Server logic (scrapers, auth, DB, quotas) is marked `server-only` and never ships to the browser.

## Extra env vars
- `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` — TikTok Research API credentials (optional) for public follower/following lists.

## Instagram reliability
Instagram answers shared datacenter IPs (like Render's free tier) with HTTP 429 / login redirects.
The adapter tries: session web API → session app API → anonymous → public link preview (rotating unfurl agents),
and serves the last good copy for 24h when blocked. Set `SCRAPER_PROXY=http://user:pass@host:port`
(residential proxy) to route all Instagram requests through a clean IP. `/api/health?ig=1` shows the last
lookup's per-step HTTP statuses (no cookie values).
