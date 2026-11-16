import { NextResponse } from "next/server";
import { isLocale, LOCALE_COOKIE } from "@/lib/i18n";

export async function POST(req: Request) {
  const { locale } = await req.json().catch(() => ({ locale: "ar" }));
  const l = isLocale(locale) ? locale : "ar";
  const res = NextResponse.json({ ok: true, locale: l });
  res.cookies.set(LOCALE_COOKIE, l, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}
