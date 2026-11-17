import { adminAction } from "@/lib/admin/guard";
import { clearErrors } from "@/lib/server/errorLog";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return adminAction("logs", async () => {
    clearErrors();
    return "تم مسح السجل ✅";
  })(req);
}
