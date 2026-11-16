import { adminAction } from "@/lib/admin/guard";
import { runProxyTest, validateProxyUrl } from "@/lib/admin/proxyTest";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return adminAction("proxy", async (_r, form) => {
    const candidate = String(form.get("candidate") ?? "").trim();
    if (candidate) {
      const bad = validateProxyUrl(candidate);
      if (bad) throw new Error(bad);
    }
    return runProxyTest(candidate || undefined);
  })(req);
}
