import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { parseItemStruct, parseVideoDetail } from "../src/lib/platforms/tiktok/parser";
import { summarizeLocation, voteCountry } from "../src/lib/platforms/tiktok/location-summary";

test("parseItemStruct reads locationCreated and poi", () => {
  const p = parseItemStruct({ id: "1", desc: "", author: { uniqueId: "a" }, locationCreated: "SA", poi: { name: "Riyadh Boulevard" }, stats: {} });
  assert.deepEqual(p.location, { country: "SA", place: "Riyadh Boulevard" });
  const q = parseItemStruct({ id: "2", desc: "", author: { uniqueId: "a" }, stats: {} });
  assert.equal(q.location, undefined);
});

test("summarizeLocation majority-votes the country (ties → most recent)", () => {
  const mk = (id: string, t: number, c?: string) => ({ ...parseItemStruct({ id, desc: "", author: { uniqueId: "a" }, stats: {}, locationCreated: c }), createdAt: t });
  const loc = summarizeLocation([mk("1", 10, "US"), mk("2", 30, "IT"), mk("3", 20, "US")], "en")!;
  assert.equal(loc.current, "US");
  const tie = summarizeLocation([mk("1", 10, "US"), mk("2", 30, "IT")], "en")!;
  assert.equal(tie.current, "IT");
  assert.deepEqual(loc.recent, [{ code: "US", count: 2 }, { code: "IT", count: 1 }]);
  assert.equal(loc.sample, 3);
  assert.equal(loc.language, "en");
});

test("real video page fixture (if present) yields a country", () => {
  if (!existsSync("/tmp/v.html")) return;
  const html = readFileSync("/tmp/v.html", "utf8");
  const m = html.match(/id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return;
  const { post } = parseVideoDetail(JSON.parse(m[1]));
  assert.match(post?.location?.country ?? "", /^[A-Z]{2}$/);
});

test("parseVideoDetail reads the mobile 'reflow' layout served to the relay Worker", () => {
  const json = { __DEFAULT_SCOPE__: { "webapp.reflow.video.detail": { statusCode: 0, itemInfo: { itemStruct: { id: "7708417312088460558", desc: "", author: { uniqueId: "zachking" }, stats: {}, locationCreated: "US" } } } } };
  const { status, post } = parseVideoDetail(json);
  assert.equal(status, 0);
  assert.equal(post?.location?.country, "US");
});

test("voteCountry ignores junk and picks the majority", () => {
  assert.deepEqual(voteCountry(["SA", undefined, "AE", "SA", "x"]), { code: "SA", count: 2, total: 3 });
  assert.deepEqual(voteCountry([]), { code: undefined, count: 0, total: 0 });
});
