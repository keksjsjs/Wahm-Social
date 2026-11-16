import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze, postsToCsv, tierOf } from "../src/lib/analytics";
import { demoPosts, demoProfile } from "../src/lib/platforms/demo";

test("analyze computes sane metrics", () => {
  const p = demoProfile("tiktok", "wahm");
  const posts = demoPosts("tiktok", "wahm", 12);
  const a = analyze(p, posts);
  assert.equal(a.postsAnalyzed, 12);
  assert.ok(a.engagementRate > 0);
  assert.ok(a.growthScore >= 0 && a.growthScore <= 100);
  assert.equal(a.weekdayHistogram.reduce((s, x) => s + x, 0), 12);
});

test("tierOf buckets followers", () => {
  assert.equal(tierOf(500), "nano");
  assert.equal(tierOf(20_000), "micro");
  assert.equal(tierOf(2_000_000), "mega");
});

test("postsToCsv escapes commas and quotes", () => {
  const posts = demoPosts("instagram", "x", 1).map((p) => ({ ...p, caption: 'a, "b"' }));
  const csv = postsToCsv(posts);
  assert.ok(csv.includes('"a, ""b"""'));
});
