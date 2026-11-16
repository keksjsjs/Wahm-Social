import { readAsset } from "@/lib/site/store";
import { ASSET_TYPES } from "@/lib/admin/assets";

export const dynamic = "force-dynamic";

/** Serves images uploaded from the admin panel (favicon, OG image, hero). Names are content-hashed. */
export async function GET(_req: Request, { params }: { params: { name: string } }) {
  const name = params.name;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const type = ASSET_TYPES[ext];
  if (!type || !/^[a-z0-9-]+\.[a-z]+$/i.test(name)) return new Response("Not found", { status: 404 });
  const body = await readAsset(name);
  if (!body) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=86400, immutable",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
