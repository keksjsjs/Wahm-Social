import { Searches } from "@/lib/server/db";
import { ok } from "@/lib/server/respond";

export const dynamic = "force-dynamic";

export function GET() {
  return ok(Searches.trending(12));
}
