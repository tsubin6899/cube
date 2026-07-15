import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the CUBE mobile search site", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>CUBE 刷卡查｜現在該切哪個方案？<\/title>/);
  assert.match(html, /現在該切哪個方案？/);
  assert.match(html, /輸入店家，例如：全聯、Netflix、Uber/);
  assert.match(html, /Level 1/);
  assert.match(html, /八種方案，一次看懂/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps the important 2026 merchant and rule data in the client source", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const expected of [
    "全聯福利中心",
    "Netflix",
    "Uber Eats",
    "台灣高鐵",
    "童樂匯",
    "慶生月",
    "PChome 24h購物",
    "2026/7/15",
  ]) {
    assert.match(source, new RegExp(expected));
  }
  assert.match(source, /group\.eligibility === "birthday"/);
  assert.match(source, /group\.eligibility === "family"/);
  assert.match(source, /window\.localStorage\.setItem\("cube-level"/);
});
