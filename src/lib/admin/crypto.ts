import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { env } from "../env";

/** AES-256-GCM with a key derived from JWT_SECRET (scrypt). Used for secrets at rest in the data repo. */
let cached: { secret: string; key: Buffer } | null = null;
function key(): Buffer {
  const secret = env.jwtSecret;
  if (cached?.secret !== secret) cached = { secret, key: scryptSync(secret, "frostly-admin-secrets-v1", 32) };
  return cached.key;
}

export interface Sealed {
  v: 1;
  iv: string;
  tag: string;
  data: string;
}

export function seal(plain: string): Sealed {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return { v: 1, iv: iv.toString("base64"), tag: c.getAuthTag().toString("base64"), data: data.toString("base64") };
}

export function unseal(s: Sealed): string {
  const d = createDecipheriv("aes-256-gcm", key(), Buffer.from(s.iv, "base64"));
  d.setAuthTag(Buffer.from(s.tag, "base64"));
  return Buffer.concat([d.update(Buffer.from(s.data, "base64")), d.final()]).toString("utf8");
}
