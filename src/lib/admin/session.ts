import "server-only";
import { createHash } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "../env";
import { adminBase } from "./path";
import { currentPasswordHash } from "./password";
import { getSettings } from "../site/store";

export const ADMIN_COOKIE = "frostly_cp";
const MAX_AGE = 60 * 60 * 12;
const key = () => new TextEncoder().encode(`${env.jwtSecret}:admin-panel`);
/** Fingerprint of the active password hash — changing the password logs every session out. */
const pwv = () => createHash("sha256").update(currentPasswordHash() || "none").digest("base64url").slice(0, 16);

export async function signAdminSession(): Promise<string> {
  return new SignJWT({ sub: "admin", pwv: pwv() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .setIssuer("frostly-admin")
    .sign(key());
}

export async function isAdmin(): Promise<boolean> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token || !adminBase()) return false;
  await getSettings(); // the password hash may live in the data repo
  try {
    const { payload } = await jwtVerify(token, key(), { issuer: "frostly-admin" });
    return payload.sub === "admin" && payload.pwv === pwv();
  } catch {
    return false;
  }
}

export function adminCookie(value: string, maxAge = MAX_AGE) {
  return {
    name: ADMIN_COOKIE,
    value,
    httpOnly: true,
    secure: env.isProd,
    sameSite: "strict" as const,
    path: adminBase() || "/",
    maxAge,
  };
}
