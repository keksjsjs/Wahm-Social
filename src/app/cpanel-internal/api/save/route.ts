import { adminAction, back } from "@/lib/admin/guard";
import { SECTION_PAGE, SECTION_PARSERS } from "@/lib/admin/sections";
import { saveSettings } from "@/lib/site/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const section = new URL(req.url).searchParams.get("section") || "";
  const parse = SECTION_PARSERS[section];
  const page = SECTION_PAGE[section] || "";
  if (!parse) return back(req, page, { err: "قسم غير معروف" });
  return adminAction(page, async (_req, form) => {
    await saveSettings((s) => parse(s, form), `admin: update ${section}`);
    return "تم الحفظ ✅ — التغيير يظهر في الموقع خلال ثوانٍ (وخلال دقيقة كحد أقصى).";
  })(req);
}
