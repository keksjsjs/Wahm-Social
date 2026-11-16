import { NextResponse } from "next/server";
import { adminCookie } from "@/lib/admin/session";
import { back, sameOrigin } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new NextResponse("Not found", { status: 404 });
  const res = back(req, "login", { ok: "تم تسجيل الخروج" });
  res.cookies.set(adminCookie("", 0));
  return res;
}
