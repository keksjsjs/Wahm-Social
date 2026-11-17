import { limit } from "../../site/flags";

/** How many follower/following rows the site shows (admin: limits.followersShow, 1–50). */
export const followersShow = () => limit("followersShow", 1, 50);
