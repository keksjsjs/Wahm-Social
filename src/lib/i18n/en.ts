import type { Dict } from "./ar";
import { brand } from "./en/brand";
import { tagline } from "./en/tagline";
import { nav } from "./en/nav";
import { search } from "./en/search";
import { hero } from "./en/hero";
import { features } from "./en/features";
import { profile } from "./en/profile";
import { post } from "./en/post";
import { stories } from "./en/stories";
import { connections } from "./en/connections";
import { analytics } from "./en/analytics";
import { days } from "./en/days";
import { download } from "./en/download";
import { compare } from "./en/compare";
import { watchlist } from "./en/watchlist";
import { pricing } from "./en/pricing";
import { pro } from "./en/pro";
import { auth } from "./en/auth";
import { account } from "./en/account";
import { states } from "./en/states";
import { footer } from "./en/footer";

/** English dictionary, assembled from per-section modules in ./en/. */
export const en: Dict = { brand, tagline, nav, search, hero, features, profile, post, stories, connections, analytics, days, download, compare, watchlist, pricing, pro, auth, account, states, footer };
