import { test } from "node:test";
import assert from "node:assert/strict";
import { thirdPartyBlocked, parseJsonBody, asCountry, isTikwmQuota } from "../src/lib/platforms/tiktok/fallback-http";
import { languageFromCountik, videoIdsFromAnalyze } from "../src/lib/platforms/tiktok/countik-parse";
import { mediaFromTikwm, postFromTikwm, profileFromTikwm, storiesFromTikwm, unwrapTikwm } from "../src/lib/platforms/tiktok/tikwm-parse";
import { isAllowedMediaUrl } from "../src/lib/server/media";

const CF_HTML = `<!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title></head></html>`;

test("thirdPartyBlocked detects Cloudflare HTML and 403 challenges", () => {
  assert.equal(thirdPartyBlocked(403, CF_HTML), true);
  assert.equal(thirdPartyBlocked(200, '{"code":0,"data":{}}'), false);
  assert.equal(thirdPartyBlocked(200, CF_HTML), true);
  const headers = new Headers({ "cf-mitigated": "challenge" });
  assert.equal(thirdPartyBlocked(403, "<html>ok</html>", headers), true);
});

test("parseJsonBody rejects HTML and accepts objects", () => {
  assert.equal(parseJsonBody(CF_HTML), null);
  assert.deepEqual(parseJsonBody('{"code":0}'), { code: 0 });
});

test("profileFromTikwm maps user + stats and does not invent a country", () => {
  const p = profileFromTikwm({
    user: { id: "1", uniqueId: "demo", nickname: "Demo", signature: "hi", avatarLarger: "https://x", secUid: "SEC", createTime: 1700000000, verified: true, UserStoryStatus: 1 },
    stats: { followerCount: 10, followingCount: 2, heartCount: 3, videoCount: 0 },
  });
  assert.ok(p);
  assert.equal(p?.username, "demo");
  assert.equal(p?.followers, 10);
  assert.equal(p?.postsCount, 0);
  assert.equal(p?.hasStory, true);
  assert.equal(p?.secUid, "SEC");
  assert.equal(p?.region, undefined);
});

test("storiesFromTikwm maps videos and skips entries without a url", () => {
  const stories = storiesFromTikwm(
    { videos: [{ id: "11", play: "https://www.tikwm.com/a.mp4", cover: "https://www.tikwm.com/a.jpg", create_time: 1700000000 }, { id: "22" }] },
    "demo",
  );
  assert.equal(stories.length, 1);
  assert.equal(stories[0].type, "video");
  assert.equal(stories[0].url, "https://www.tikwm.com/a.mp4");
  assert.equal(storiesFromTikwm({ videos: [] }, "demo").length, 0);
});

test("mediaFromTikwm prefers hdplay and unwraps envelopes", () => {
  const m = mediaFromTikwm({ hdplay: "https://www.tikwm.com/hd.mp4", play: "https://www.tikwm.com/sd.mp4", region: "sa", id: "99", author: { unique_id: "demo" } });
  assert.equal(m?.play, "https://www.tikwm.com/hd.mp4");
  assert.equal(m?.region, "SA");
  assert.deepEqual(unwrapTikwm({ code: 0, data: { ok: 1 } }), { ok: true, data: { ok: 1 } });
  const miss = unwrapTikwm({ code: -1, msg: "User not found" });
  assert.equal(miss.ok, false);
  assert.equal(miss.ok === false && miss.notFound, true);
  const post = postFromTikwm({ id: "99", hdplay: "https://www.tikwm.com/hd.mp4", title: "hi #fyp", region: "SA", author: { unique_id: "demo" } });
  assert.equal(post?.location?.country, "SA");
  assert.ok(post?.hashtags.includes("fyp"));
});

test("countik helpers return language and video ids, never a country", () => {
  assert.equal(languageFromCountik({ language: "ar" }), "ar");
  assert.equal(languageFromCountik({}), undefined);
  assert.deepEqual(videoIdsFromAnalyze({ videos: [{ id: "7704740944427388191" }, { id: "bad" }] }), ["7704740944427388191"]);
  assert.deepEqual(videoIdsFromAnalyze({ videos: [] }), []);
  assert.equal(asCountry("SA"), "SA");
  assert.equal(asCountry("Saudi Arabia"), undefined);
});

test("media proxy allows tikwm.com but not lookalikes", () => {
  assert.ok(isAllowedMediaUrl("https://www.tikwm.com/video/media/play/x.mp4"));
  assert.ok(!isAllowedMediaUrl("https://tikwm.com.evil.com/x"));
});

test("unwrapTikwm and isTikwmQuota detect the free daily limit honestly", () => {
  const quota = { code: -1, msg: "Free Api Limit: 10000 request/ 1 day." };
  assert.equal(isTikwmQuota(quota), true);
  const unwrapped = unwrapTikwm(quota);
  assert.equal(unwrapped.ok, false);
  assert.equal(unwrapped.ok === false && unwrapped.quota, true);
  assert.equal(unwrapped.ok === false && unwrapped.notFound, undefined);
  const miss = unwrapTikwm({ code: -1, msg: "User not found" });
  assert.equal(miss.ok, false);
  assert.equal(miss.ok === false && miss.quota, undefined);
  assert.equal(miss.ok === false && miss.notFound, true);
  assert.equal(isTikwmQuota({ code: 0, data: {} }), false);
});
