import { adminAction } from "@/lib/admin/guard";
import { ASSET_KINDS, prepareAsset } from "@/lib/admin/assets";
import { assetPath, saveSettings } from "@/lib/site/store";
import { siteNow } from "@/lib/site/snapshot";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return adminAction("seo", async (_r, form) => {
    const kind = String(form.get("kind") ?? "") as (typeof ASSET_KINDS)[number];
    if (!ASSET_KINDS.includes(kind)) throw new Error("نوع غير معروف");
    const old = siteNow().assets[kind];
    if (form.get("remove") === "on") {
      await saveSettings((s) => ({ ...s, assets: { ...s.assets, [kind]: "" } }), `admin: remove ${kind}`, old ? { [assetPath(old)]: null } : {});
      return "تم الرجوع للصورة الافتراضية ✅";
    }
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) throw new Error("اختر صورة أولاً");
    const { name, body } = await prepareAsset(kind, file);
    const extra: Record<string, Buffer | null> = { [assetPath(name)]: body };
    if (old && old !== name) extra[assetPath(old)] = null;
    await saveSettings((s) => ({ ...s, assets: { ...s.assets, [kind]: name } }), `admin: upload ${kind}`, extra);
    return "تم رفع الصورة ✅";
  })(req);
}
