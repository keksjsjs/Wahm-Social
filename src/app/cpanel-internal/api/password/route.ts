import { adminAction, back } from "@/lib/admin/guard";
import { checkAdminPassword, hashAdminPassword, validateNewPassword } from "@/lib/admin/password";
import { adminCookie, signAdminSession } from "@/lib/admin/session";
import { saveSecrets } from "@/lib/site/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return adminAction("security", async (r, form) => {
    const current = String(form.get("current") ?? "");
    const next = String(form.get("next") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (!(await checkAdminPassword(current))) throw new Error("كلمة المرور الحالية غير صحيحة");
    if (next !== confirm) throw new Error("التأكيد لا يطابق كلمة المرور الجديدة");
    const bad = validateNewPassword(next);
    if (bad) throw new Error(bad);
    const hash = await hashAdminPassword(next);
    await saveSecrets((cur) => ({ ...cur, adminPasswordHash: hash }), "admin: change password");
    // Old sessions are now invalid; issue a fresh one for this browser.
    const res = back(r, "security", { ok: "تم تغيير كلمة المرور ✅" });
    res.cookies.set(adminCookie(await signAdminSession()));
    return res;
  })(req);
}
