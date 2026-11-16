import "server-only";
import bcrypt from "bcryptjs";
import { snapshot } from "../site/snapshot";

/** Hash changed from the panel (encrypted in the data repo) wins over ADMIN_PASSWORD_HASH on Render. */
export function currentPasswordHash(): string {
  return snapshot().secrets.adminPasswordHash || process.env.ADMIN_PASSWORD_HASH || "";
}

export async function checkAdminPassword(pw: string): Promise<boolean> {
  const hash = currentPasswordHash();
  if (!hash || !pw || pw.length > 200) return false;
  return bcrypt.compare(pw, hash);
}

export function validateNewPassword(pw: string): string | null {
  if (pw.length < 10) return "كلمة المرور لازم تكون 10 أحرف على الأقل";
  if (pw.length > 128) return "كلمة المرور طويلة جداً";
  return null;
}

export const hashAdminPassword = (pw: string) => bcrypt.hash(pw, 12);
