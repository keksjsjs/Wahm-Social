import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { requireFeature } from "@/lib/server/auth";
import { Users } from "@/lib/server/db";
import { handler } from "@/lib/server/respond";

export const POST = handler(async () => {
  const user = await requireFeature("api_access");
  const apiKey = "wahm_" + crypto.randomBytes(24).toString("base64url");
  Users.update(user.id, { apiKey });
  return NextResponse.json({ ok: true, data: { apiKey } });
});
