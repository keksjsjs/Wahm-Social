import { getPosts } from "@/lib/platforms";
import { postsToCsv } from "@/lib/analytics";
import { requireFeature } from "@/lib/server/auth";
import { parsePlatform, parseUsername } from "@/lib/server/guard";
import { fail } from "@/lib/server/respond";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { platform: string; username: string } }) {
  try {
    await requireFeature("export_csv");
    const platform = parsePlatform(params.platform);
    const username = parseUsername(params.username);
    const { data } = await getPosts(platform, username, 30);
    return new Response("\uFEFF" + postsToCsv(data), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="wahm_${platform}_${username}.csv"`,
      },
    });
  } catch (e) {
    return fail(e);
  }
}
