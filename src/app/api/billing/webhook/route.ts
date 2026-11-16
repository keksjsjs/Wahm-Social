/**
 * Stripe webhook. Verifies the `stripe-signature` header (HMAC-SHA256) and
 * applies `checkout.session.completed` / `customer.subscription.deleted`.
 */
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { Payments, Users } from "@/lib/server/db";
import type { PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";

function verify(payload: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=") as [string, string]));
  const expected = crypto.createHmac("sha256", secret).update(`${parts.t}.${payload}`).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1 ?? ""));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const payload = await req.text();
  if (!env.stripeWebhookSecret || !verify(payload, req.headers.get("stripe-signature"), env.stripeWebhookSecret)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const event = JSON.parse(payload);
  const obj = event.data?.object ?? {};
  if (event.type === "checkout.session.completed" && obj.client_reference_id) {
    const plan = (obj.metadata?.plan ?? "pro") as PlanId;
    const interval = obj.metadata?.interval === "year" ? "year" : "month";
    Users.update(obj.client_reference_id, { plan, planRenewsAt: Date.now() + (interval === "year" ? 366 : 31) * 864e5 });
    Payments.create({
      userId: obj.client_reference_id,
      plan,
      interval,
      amount: (obj.amount_total ?? 0) / 100,
      currency: (obj.currency ?? "usd").toUpperCase(),
      provider: "stripe",
      status: "paid",
    });
  }
  if (event.type === "customer.subscription.deleted" && obj.metadata?.userId) {
    Users.update(obj.metadata.userId, { plan: "free" });
  }
  return NextResponse.json({ ok: true });
}
