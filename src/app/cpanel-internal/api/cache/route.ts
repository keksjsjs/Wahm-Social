import { adminAction } from "@/lib/admin/guard";
import { cache } from "@/lib/server/cache";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return adminAction("status", async () => {
    const n = cache.stats().size;
    cache.clear();
    return `تم مسح الكاش (${n} عنصر) ✅`;
  })(req);
}
