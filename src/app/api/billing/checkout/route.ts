/**
 * Starts a Pro subscription.
 *  - mock mode (no STRIPE_SECRET_KEY): upgrades immediately and records a mock payment.
 *  - stripe mode: creates a Stripe Checkout Session via REST and returns its URL.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { env, billingMode } from "@/lib/env";
import { PLANS } from "@/lib/plans";
import { Payments, Users } from "@/lib/server/db";
import { requireUser } from "@/lib/server/auth";
import { handler } from "@/lib/server/respond";
import { PlatformError } from "@/lib/platforms/types";
import { requireFeatureOn } from "@/lib/site/flags";

const Body = z.object({ plan: z.enum(["pro", "business"]), interval: z.enum(["month", "year"]) });

export const POST = handler(async (req: Request) => {
  requireFeatureOn("pro");
  const user = await requireUser();
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) throw new PlatformError("invalid_input", "Invalid plan", 400);
  const { plan, interval } = parsed.data;
  const p = PLANS[plan];
  const amount = interval === "year" ? p.priceYearly : p.priceMonthly;

  if (billingMode() === "mock") {
    const renews = Date.now() + (interval === "year" ? 365 : 30) * 864e5;
    Users.update(user.id, { plan, planRenewsAt: renews });
    Payments.create({ userId: user.id, plan, interval, amount, currency: "USD", provider: "mock", status: "paid" });
    return NextResponse.json({ ok: true, data: { mode: "mock", redirect: "/account?upgraded=1" } });
  }

  const price = interval === "year" ? env.stripePriceYearly : env.stripePriceMonthly;
  if (!price) throw new PlatformError("internal", "Stripe price ids are not configured", 500);
  const form = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    success_url: `${env.siteUrl}/account?upgraded=1`,
    cancel_url: `${env.siteUrl}/pricing?canceled=1`,
    client_reference_id: user.id,
    customer_email: user.email,
    "metadata[plan]": plan,
    "metadata[interval]": interval,
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { authorization: `Bearer ${env.stripeSecret}`, "content-type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const json = (await res.json()) as { url?: string; error?: { message: string } };
  if (!res.ok || !json.url) throw new PlatformError("upstream_error", json.error?.message ?? "Stripe error", 502);
  return NextResponse.json({ ok: true, data: { mode: "stripe", redirect: json.url } });
});
