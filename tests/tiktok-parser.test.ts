import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { parseEmbedState, parseTikTokRef, parseUserDetail, timeFromId } from "../src/lib/platforms/tiktok/parser";

const fx = (n: string) => JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", n), "utf8"));

test("parseUserDetail extracts a public profile", () => {
  const r = parseUserDetail(fx("tiktok-user.json"));
  assert.equal(r.status, 0);
  assert.equal(r.profile?.username, "khaby.lame");
  assert.ok((r.profile?.followers ?? 0) > 1_000_000);
  assert.equal(r.profile?.platform, "tiktok");
});

test("parseUserDetail reports missing users", () => {
  const r = parseUserDetail({ __DEFAULT_SCOPE__: { "webapp.user-detail": { statusCode: 10221 } } });
  assert.equal(r.status, 10221);
  assert.equal(r.profile, undefined);
});

test("parseEmbedState returns recent videos with media", () => {
  const r = parseEmbedState(fx("tiktok-embed.json"), "khaby.lame");
  assert.equal(r.posts.length, 3);
  assert.ok(r.posts[0].media[0].url.startsWith("https://"));
  assert.ok(r.posts[0].createdAt && r.posts[0].createdAt > 1_600_000_000);
});

test("timeFromId decodes TikTok snowflake ids", () => {
  const t = timeFromId("7704740944427388191");
  assert.ok(t && t > 1_700_000_000);
  assert.equal(timeFromId("abc"), undefined);
});

test("parseTikTokRef handles urls, ids and short links", () => {
  assert.deepEqual(parseTikTokRef("https://www.tiktok.com/@a.b/video/7704740944427388191"), { username: "a.b", id: "7704740944427388191" });
  assert.deepEqual(parseTikTokRef("7704740944427388191"), { id: "7704740944427388191" });
  assert.ok(parseTikTokRef("https://vm.tiktok.com/ZMabc123/").shortUrl);
});
