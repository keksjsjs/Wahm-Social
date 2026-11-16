import { test } from "node:test";
import assert from "node:assert/strict";
import { compact, extractHashtags, isValidUsername, normalizeUsername } from "../src/lib/format";
import { routeForQuery } from "../src/lib/route";
import { isAllowedMediaUrl } from "../src/lib/server/media";

test("normalizeUsername strips @, urls and junk", () => {
  assert.equal(normalizeUsername("@Khaby.Lame"), "khaby.lame");
  assert.equal(normalizeUsername("https://www.instagram.com/natgeo/"), "natgeo");
  assert.equal(normalizeUsername("https://www.tiktok.com/@mrbeast?lang=en"), "mrbeast");
  assert.ok(isValidUsername("a_b.c"));
  assert.ok(!isValidUsername("..."));
});

test("compact formats large numbers", () => {
  assert.equal(compact(1_500, "en"), "1.5K");
  assert.equal(compact(162_900_000, "en"), "163M");
});

test("extractHashtags supports arabic", () => {
  assert.deepEqual(extractHashtags("hi #FYP #السعودية #fyp"), ["fyp", "السعودية"]);
});

test("routeForQuery maps inputs to pages", () => {
  assert.equal(routeForQuery("khaby.lame", "tiktok"), "/tiktok/khaby.lame");
  assert.equal(routeForQuery("https://www.tiktok.com/@a/video/7704740944427388191", "instagram"), "/tiktok/a/post/7704740944427388191");
  assert.match(routeForQuery("https://www.instagram.com/reel/Cxyz123abc/", "tiktok") ?? "", /^\/download\?url=/);
  assert.equal(routeForQuery("bad name!", "tiktok"), null);
});

test("media proxy only allows platform CDNs", () => {
  assert.ok(isAllowedMediaUrl("https://p16-common-sign.tiktokcdn-us.com/x.jpg"));
  assert.ok(isAllowedMediaUrl("https://scontent.cdninstagram.com/x.jpg"));
  assert.ok(!isAllowedMediaUrl("https://evil.com/x.jpg"));
  assert.ok(!isAllowedMediaUrl("http://169.254.169.254/latest"));
  assert.ok(!isAllowedMediaUrl("https://tiktokcdn.com.evil.com/x"));
  assert.ok(isAllowedMediaUrl("https://www.tikwm.com/x.mp4"));
});
