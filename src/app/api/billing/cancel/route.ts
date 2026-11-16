import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { Users } from "@/lib/server/db";
import { handler } from "@/lib/server/respond";

export const POST = handler(async () => {
  const user = await requireUser();
  // Keeps access until planRenewsAt; currentUser() downgrades after expiry.
  Users.update(user.id, { planRenewsAt: user.planRenewsAt ?? Date.now() });
  return NextResponse.json({ ok: true, data: { activeUntil: user.planRenewsAt } });
});
