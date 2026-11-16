import { NextResponse } from "next/server";
import { checkAdminPassword } from "@/lib/admin/password";
import { adminCookie, signAdminSession } from "@/lib/admin/session";
import { back, sameOrigin } from "@/lib/admin/guard";
import { adminBase } from "@/lib/admin/path";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { getSettings } from "@/lib/site/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!adminBase() || !sameOrigin(req)) return new NextResponse("Not found", { status: 404 });
  const ip = clientIp(req);
  const perIp = rateLimit(`cp-login:${ip}`, 5, 15 * 60_000);
  const global = rateLimit("cp-login:*", 40, 15 * 60_000);
  if (!perIp.allowed || !global.allowed) {
    return back(req, "login", { err: `محاولات كثيرة. حاول بعد ${Math.ceil(perIp.resetMs / 60_000) || 15} دقيقة.` });
  }
  await getSettings();
  const form = await req.formData().catch(() => null);
  const pw = String(form?.get("password") ?? "");
  const ok = await checkAdminPassword(pw);
  if (!ok) {
    await new Promise((r) => setTimeout(r, 600));
    return back(req, "login", { err: "كلمة المرور غير صحيحة" });
  }
  const res = back(req, "", { ok: "أهلاً بك 👋" });
  res.cookies.set(adminCookie(await signAdminSession()));
  return res;
}
