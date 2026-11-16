# Wahm Social · وهم سوشال

Arabic-first SaaS for **public** TikTok & Instagram account insights: profile viewer, recent posts, watermark-free downloads, public story viewer, analytics, compare, watchlist and Pro plans.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind**, deployed as a single Render web service.

## Features
- Platform toggle (TikTok | Instagram), username or URL search
- SSR profile pages with OG images, JSON-LD (ProfilePage, VideoObject, FAQ, Breadcrumbs), sitemap & robots
- Post detail + no-watermark video / image / audio downloads (streamed through an allow-listed media proxy)
- Story viewer (Instagram public stories, needs `IG_SESSIONID`)
- Followers/following: honest locked state (not exposed publicly by platforms)
- Analytics: engagement rate, averages, posting frequency, best day/hour, top hashtags, earnings estimate, Wahm score
- Pro: batch download, compare accounts, watchlist, CSV export, advanced analytics; Business: API keys
- Auth: email/password + JWT httpOnly cookie, magic-link stub; per-plan daily quotas; burst rate limiting
- Billing: mock mode by default; Stripe Checkout + signed webhook when keys are set
- Admin dashboard, AR/EN i18n with RTL, dark navy/gold design

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
