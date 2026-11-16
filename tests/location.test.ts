import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { parseItemStruct, parseVideoDetail } from "../src/lib/platforms/tiktok/parser";
import { summarizeLocation } from "../src/lib/platforms/tiktok/location-summary";

test("parseItemStruct reads locationCreated and poi", () => {
  const p = parseItemStruct({ id: "1", desc: "", author: { uniqueId: "a" }, locationCreated: "SA", poi: { name: "Riyadh Boulevard" }, stats: {} });
  assert.deepEqual(p.location, { country: "SA", place: "Riyadh Boulevard" });
  const q = parseItemStruct({ id: "2", desc: "", author: { uniqueId: "a" }, stats: {} });
  assert.equal(q.location, undefined);
});

test("summarizeLocation picks latest country and frequency", () => {
  const mk = (id: string, t: number, c?: string) => ({ ...parseItemStruct({ id, desc: "", author: { uniqueId: "a" }, stats: {}, locationCreated: c }), createdAt: t });
  const loc = summarizeLocation([mk("1", 10, "US"), mk("2", 30, "IT"), mk("3", 20, "US")], "en")!;
  assert.equal(loc.current, "IT");
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
