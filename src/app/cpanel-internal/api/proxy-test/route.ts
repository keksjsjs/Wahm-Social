import { adminAction } from "@/lib/admin/guard";
import { runProxyTest, runRelayTest, validateProxyUrl } from "@/lib/admin/proxyTest";
import { validateRelayUrl } from "@/lib/server/relay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return adminAction("proxy", async (_r, form) => {
    if (String(form.get("mode") ?? "") === "relay") {
      const candidate = String(form.get("relayCandidate") ?? "").trim();
      if (candidate) {
        const bad = validateRelayUrl(candidate);
        if (bad) throw new Error(bad);
      }
      return runRelayTest(candidate || undefined);
    }
    const candidate = String(form.get("candidate") ?? "").trim();
    if (candidate) {
      const bad = validateProxyUrl(candidate);
      if (bad) throw new Error(bad);
    }
    return runProxyTest(candidate || undefined);
  })(req);
}
