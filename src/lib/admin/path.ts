/** Secret admin URL: /<ADMIN_PATH>/… is rewritten by middleware to the internal route folder. */
export const INTERNAL_PREFIX = "/cpanel-internal";

export function adminSlug(): string {
  const v = (process.env.ADMIN_PATH || "").replace(/^\/+|\/+$/g, "");
  return /^[A-Za-z0-9_-]{16,}$/.test(v) ? v : "";
}

/** Public base path of the panel, e.g. "/x-abc…". Empty string when the panel is disabled. */
export const adminBase = () => (adminSlug() ? `/${adminSlug()}` : "");
export const adminHref = (sub = "") => `${adminBase()}${sub ? (sub.startsWith("/") ? sub : `/${sub}`) : ""}`;
