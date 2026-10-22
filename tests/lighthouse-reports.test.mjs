import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const code = ts.transpileModule(readFileSync(new URL("../src/lib/lighthouse-reports.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
const report = (strategy, auditedAt = "2026-10-22T06:00:00Z") => ({
  strategy, auditedAt, url: "https://example.test/", scores: { performance: 98, accessibility: 100, "best-practices": 100, seo: 100 },
});
function harness(snapshot, response) {
  const calls = [];
  const context = {
    exports: {}, process: { env: { WORDPRESS_API_URL: "https://cms.example.test/wp-json/" }, cwd: () => "/site" },
    URL, AbortSignal,
    require(name) {
      if (name === "node:fs/promises") return { readFile: async () => JSON.stringify(snapshot) };
      if (name === "node:path") return { join: (...parts) => parts.join("/") };
      throw new Error(`Unexpected dependency: ${name}`);
    },
    fetch: async (url, options) => { calls.push({ url, options }); return response(); },
  };
  vm.runInNewContext(code, context);
  return { get: context.exports.getLighthouseReports, calls };
}

test("scheduled scores replace older build results without persistent caching", async () => {
  const fresh = report("desktop");
  const { get, calls } = harness({ reports: { desktop: report("desktop", "2026-10-19T06:00:00Z") } }, () => Response.json({ reports: { desktop: fresh } }));
  assert.equal(JSON.stringify(await get()), JSON.stringify({ desktop: fresh }));
  assert.equal(calls[0].url, "https://cms.example.test/?rest_route=/portfolio/v1/lighthouse");
  assert.equal(calls[0].options.cache, "no-store");
});

test("a failed CMS request retains the snapshot and an unavailable first audit leaves no fabricated scores", async () => {
  for (const snapshot of [{ reports: { desktop: report("desktop") } }, { reports: {} }]) {
    const { get } = harness(snapshot, () => { throw new Error("Offline"); });
    assert.equal(JSON.stringify(await get()), JSON.stringify(snapshot.reports));
  }
});

test("strategies merge independently, rejecting incomplete, invalid and older reports", async () => {
  for (const invalid of [
    report("desktop", "invalid"),
    { ...report("desktop"), scores: { performance: 98 } },
    { ...report("desktop"), scores: { ...report("desktop").scores, performance: 101 } },
    { ...report("desktop"), url: "javascript:alert(1)" },
    report("mobile"),
    report("desktop", "2026-10-18T06:00:00Z"),
  ]) {
    const desktop = report("desktop", "2026-10-19T06:00:00Z");
    const mobile = report("mobile");
    const { get } = harness({ reports: { desktop } }, () => Response.json({ reports: { desktop: invalid, mobile } }));
    const actual = await get();
    assert.equal(JSON.stringify(actual.desktop), JSON.stringify(desktop));
    assert.equal(JSON.stringify(actual.mobile), JSON.stringify(mobile));
  }
});
