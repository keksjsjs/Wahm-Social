import { adminAction } from "@/lib/admin/guard";
import { refreshSettings } from "@/lib/site/store";
import { snapshot } from "@/lib/site/snapshot";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return adminAction("status", async () => {
    await refreshSettings();
    const e = snapshot().error;
    if (e) throw new Error(e);
    return "تم تحديث الإعدادات من التخزين ✅";
  })(req);
}
