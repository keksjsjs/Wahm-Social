/**
 * Magic-link stub. In production wire an email provider (Resend/SES) and send
 * `${siteUrl}/api/auth/magic?token=...`. For now we always respond 200 to avoid
 * leaking which emails exist.
 */
import { NextResponse } from "next/server";
import { burstGuard } from "@/lib/server/guard";
import { handler } from "@/lib/server/respond";

export const POST = handler(async (req: Request) => {
  burstGuard(req, "auth", 5);
  await req.json().catch(() => ({}));
  return NextResponse.json({ ok: true, data: { sent: true, mode: "stub" } });
});
