/** Arabic (default) dictionary. Keys are shared with en.ts — keep them in sync. */
import { brand } from "./ar/brand";
import { tagline } from "./ar/tagline";
import { nav } from "./ar/nav";
import { search } from "./ar/search";
import { hero } from "./ar/hero";
import { features } from "./ar/features";
import { profile } from "./ar/profile";
import { post } from "./ar/post";
import { stories } from "./ar/stories";
import { connections } from "./ar/connections";
import { analytics } from "./ar/analytics";
import { days } from "./ar/days";
import { download } from "./ar/download";
import { compare } from "./ar/compare";
import { watchlist } from "./ar/watchlist";
import { pricing } from "./ar/pricing";
import { pro } from "./ar/pro";
import { auth } from "./ar/auth";
import { account } from "./ar/account";
import { states } from "./ar/states";
import { footer } from "./ar/footer";

/** Arabic (default) dictionary, assembled from per-section modules in ./ar/. */
export const ar = { brand, tagline, nav, search, hero, features, profile, post, stories, connections, analytics, days, download, compare, watchlist, pricing, pro, auth, account, states, footer };

export type Dict = typeof ar;
