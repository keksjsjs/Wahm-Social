import { test } from "node:test";
import assert from "node:assert/strict";
import { isRelayHost, readRelayUrl, rewriteViaRelay, shouldRelay, validateRelayUrl } from "../src/lib/server/relay";

test("validateRelayUrl accepts http(s) worker URLs and rejects junk", () => {
  assert.equal(validateRelayUrl("https://frostly.example.workers.dev"), null);
  assert.equal(validateRelayUrl("https://frostly.example.workers.dev/"), null);
  assert.ok(validateRelayUrl("ftp://x"));
  assert.ok(validateRelayUrl("not a url"));
});

test("rewriteViaRelay encodes the target and strips a trailing slash on the base", () => {
  const base = "https://frostly.example.workers.dev";
  const target = "https://www.tiktok.com/@khaby.lame?lang=en";
  assert.equal(rewriteViaRelay(target, base), `${base}/?u=${encodeURIComponent(target)}`);
  assert.equal(readRelayUrl("https://frostly.example.workers.dev/"), base);
});

test("shouldRelay only rewrites allowlisted GET hosts when RELAY_URL is set", () => {
  const prev = process.env.RELAY_URL;
  process.env.RELAY_URL = "https://frostly.example.workers.dev";
  try {
    assert.equal(isRelayHost("https://www.tiktok.com/@khaby.lame"), true);
    assert.equal(isRelayHost("https://www.tikwm.com/api/user/info"), true);
    assert.equal(isRelayHost("https://countik.com/api/userinfo"), true);
    assert.equal(isRelayHost("https://i.instagram.com/"), false);
    assert.equal(shouldRelay("https://www.tiktok.com/@khaby.lame"), true);
    assert.equal(shouldRelay("https://www.tiktok.com/@khaby.lame", { headers: { cookie: "sessionid=x" } }), false);
    assert.equal(shouldRelay("https://www.tikwm.com/api/", { method: "POST", body: "url=1" }), false);
    assert.equal(shouldRelay("https://m.tiktok.com/@khaby.lame"), false);
  } finally {
    if (prev === undefined) delete process.env.RELAY_URL;
    else process.env.RELAY_URL = prev;
  }
});

test("shouldRelay is off when RELAY_URL is empty", () => {
  const prev = process.env.RELAY_URL;
  delete process.env.RELAY_URL;
  try {
    assert.equal(shouldRelay("https://www.tiktok.com/@khaby.lame"), false);
  } finally {
    if (prev === undefined) delete process.env.RELAY_URL;
    else process.env.RELAY_URL = prev;
  }
});

import { looksLikeBotWall } from "../src/lib/server/http";

test("looksLikeBotWall does not flag a real TikTok page that mentions a captcha API domain", () => {
  const real = `<!doctype html><html><head><script id="api-domains" type="application/json">{"kind":"m","captcha":"","imApi":"https://im-api.tiktok.com"}</script></head><body><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__">{}</script></body></html>`;
  assert.equal(looksLikeBotWall(real), false);
  const wall = `<!DOCTYPE html><html><head><title>Just a moment...</title></head><body>challenge-platform</body></html>`;
  assert.equal(looksLikeBotWall(wall), true);
});
