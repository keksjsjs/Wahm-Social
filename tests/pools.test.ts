import { test } from "node:test";
import assert from "node:assert/strict";
import { maskIp, maskProxyUrl, describeEntry } from "../src/lib/pools/mask";
import { normalizeProxyLine, validateProxy } from "../src/lib/pools/validate";
import { applyOp, currentList, writeList } from "../src/lib/pools/ops";
import { seedFromEnv, storedPool } from "../src/lib/pools/read";
import { scrub } from "../src/lib/server/errorLog";

test("maskProxyUrl hides the password and most of the username", () => {
  const m = maskProxyUrl("http://ymnlsmha-rotate:secretpw@p.webshare.io:80/");
  assert.equal(m, "http://ymn••••:••••@p.webshare.io:80");
  assert.ok(!m.includes("secretpw"));
  assert.equal(maskIp("191.96.254.138"), "191.96.x.x");
});

test("normalizeProxyLine accepts curl lines and host:port:user:pass", () => {
  assert.equal(normalizeProxyLine('curl --proxy "http://u:p@1.2.3.4:6185/" https://ipv4.webshare.io/'), "http://u:p@1.2.3.4:6185");
  assert.equal(normalizeProxyLine("1.2.3.4:6185:user:pass"), "http://user:pass@1.2.3.4:6185");
  assert.equal(validateProxy("socks5://a:b@h:1"), "البروكسي لازم يبدأ بـ http:// أو https:// (SOCKS غير مدعوم حالياً)");
  assert.equal(validateProxy("http://u:p@h:80"), null);
});

test("pools seed from env, then reorder / toggle / delete in place", () => {
  const env = { SCRAPER_PROXY: "http://a:b@h1:1,http://c:d@h2:2" } as unknown as NodeJS.ProcessEnv;
  const secrets: Record<string, string> = {};
  assert.equal(storedPool(secrets, "proxies"), null);
  const seeded = currentList(secrets, "proxies", env);
  assert.equal(seeded.length, 2);
  let list = applyOp(seeded, "down", "env0");
  assert.deepEqual(list.map((e) => e.id), ["env1", "env0"]);
  list = applyOp(list, "toggle", "env1");
  assert.equal(list[0].enabled, false);
  writeList(secrets, "proxies", applyOp(list, "delete", "env0"));
  assert.equal(storedPool(secrets, "proxies")!.length, 1);
  assert.deepEqual(seedFromEnv("tiktok", {} as NodeJS.ProcessEnv), []);
});

test("session descriptions never include values", () => {
  const d = describeEntry("tiktok", { id: "a", label: "", enabled: true, cookie: "sessionid=SECRETVALUE123; msToken=XYZ" });
  assert.ok(!d.includes("SECRETVALUE123") && !d.includes("XYZ"));
  const i = describeEntry("instagram", { id: "b", label: "", enabled: true, ig: { sessionid: "123%3Aabcdef" } });
  assert.ok(!i.includes("abcdef"));
});

test("error log scrubbing removes credentials", () => {
  const s = scrub("failed http://user:pw@1.2.3.4:80 sessionid=abc123; msToken=zzz");
  assert.ok(!s.includes("pw@") && !s.includes("abc123") && !s.includes("zzz"));
});
