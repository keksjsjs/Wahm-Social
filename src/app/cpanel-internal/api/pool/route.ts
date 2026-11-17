import { adminAction } from "@/lib/admin/guard";
import { saveSecrets } from "@/lib/site/store";
import { snapshot } from "@/lib/site/snapshot";
import { applyOp, currentList, MAX_ENTRIES, writeList, type PoolOp } from "@/lib/pools/ops";
import { buildEntries } from "@/lib/pools/build";
import { testEntry } from "@/lib/pools/test";
import { POOL_KINDS, POOL_TITLE, type PoolKind } from "@/lib/pools/types";
import { cache } from "@/lib/server/cache";

export const dynamic = "force-dynamic";

const OPS: PoolOp[] = ["delete", "up", "down", "toggle", "label", "top"];
const PAGE: Record<PoolKind, string> = { proxies: "proxy", relays: "proxy", tiktok: "sessions", instagram: "sessions" };

/** Add / delete / reorder / enable / rename / test entries of a pool. */
export async function POST(req: Request) {
  const u = new URL(req.url);
  const kind = u.searchParams.get("kind") as PoolKind;
  const page = POOL_KINDS.includes(kind) ? PAGE[kind] : "proxy";
  return adminAction(page, async (_r, form) => {
    if (!POOL_KINDS.includes(kind)) throw new Error("قائمة غير معروفة");
    const op = String(form.get("op") ?? "");
    const id = String(form.get("id") ?? "");

    if (op === "test" || op === "testall") {
      const list = currentList(snapshot().secrets, kind);
      const targets = op === "test" ? list.filter((e) => e.id === id) : list;
      if (!targets.length) throw new Error("ما فيه عناصر للاختبار");
      const out: string[] = [];
      for (const e of targets.slice(0, 8)) out.push(await testEntry(kind, e));
      return out.join("\n\n");
    }

    if (op === "add") {
      const added = buildEntries(kind, form);
      await saveSecrets((cur) => {
        const list = currentList(cur, kind);
        if (list.length + added.length > MAX_ENTRIES) throw new Error(`الحد الأقصى ${MAX_ENTRIES} عنصر`);
        return writeList(cur, kind, [...list, ...added]);
      }, `admin: add ${kind}`);
      flushScrapeCache();
      return `تمت إضافة ${added.length} إلى ${POOL_TITLE[kind]} ✅ (تنحفظ مشفّرة)`;
    }

    if (!OPS.includes(op as PoolOp)) throw new Error("عملية غير معروفة");
    await saveSecrets((cur) => writeList(cur, kind, applyOp(currentList(cur, kind), op as PoolOp, id, String(form.get("label") ?? ""))), `admin: ${op} ${kind}`);
    flushScrapeCache();
    return op === "delete" ? "تم الحذف ✅" : "تم التحديث ✅";
  })(req);
}

/** Empty results cached under the old proxy/session should not linger. */
function flushScrapeCache() {
  cache.clear();
}
