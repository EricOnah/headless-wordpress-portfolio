import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const defaults = JSON.parse(readFileSync(new URL("../cms/mu-plugins/portfolio-button-labels.json", import.meta.url), "utf8"));
const code = ts.transpileModule(readFileSync(new URL("../src/lib/button-labels.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;

function harness(response, env = { WORDPRESS_API_URL: "https://cms.example.test/wp-json/" }) {
  const calls = [];
  const context = {
    exports: {}, process: { env }, console: { error() {} },
    require(name) {
      if (name === "react") return { cache: fn => fn };
      if (name.endsWith("portfolio-button-labels.json")) return defaults;
      if (name === "@/lib/wordpress-content") return { fetchPortfolioContent: async url => {
        calls.push(url);
        return response(url);
      } };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  vm.runInNewContext(code, context);
  return { get: context.exports.getButtonLabels, calls };
}

test("published WordPress labels override defaults for every section without accepting unknown fields", async () => {
  const routes = { header: "header-contents", profile: "professional-profiles", skills: "skills-sections", experience: "experience-sections", projects: "project-sections", posts: "posts-sections", contact: "contact-pages", footer: "footer-contents" };
  for (const [section, fields] of Object.entries(defaults)) {
    const saved = Object.fromEntries(Object.keys(fields).map(key => [key, `Edited ${key}`]));
    const { get, calls } = harness(() => Response.json([{ button_labels: { ...saved, unknown: "ignored" } }]));
    const result = await get(section);
    assert.equal(JSON.stringify(result), JSON.stringify(saved));
    const url = new URL(calls[0]);
    assert.equal(url.origin, "https://cms.example.test");
    assert.equal(url.searchParams.get("rest_route"), `/wp/v2/${routes[section]}`);
    assert.equal(url.searchParams.get("status"), "publish");
    assert.equal(url.searchParams.get("orderby"), "modified");
    assert.equal(url.searchParams.get("order"), "desc");
    assert.equal(url.searchParams.get("per_page"), "1");
  }
});

test("old CMS entries, missing entries, empty values and invalid values retain usable labels", async () => {
  for (const body of [[], [{}], [{ button_labels: { submit_label: "", sending_label: 42 } }], [{ button_labels: { submit_label: "  " } }]]) {
    const { get } = harness(() => Response.json(body));
    assert.equal(JSON.stringify(await get("contact")), JSON.stringify(defaults.contact));
  }
});

test("offline or malformed CMS responses fall back without breaking rendering", async () => {
  for (const response of [() => { throw new Error("offline"); }, () => new Response("bad gateway", { status: 502 }), () => Response.json(null)]) {
    const { get } = harness(response);
    assert.equal(JSON.stringify(await get("header")), JSON.stringify(defaults.header));
  }
});

test("unconfigured CMS uses defaults without making requests", async () => {
  const { get, calls } = harness(() => { throw new Error("should not fetch"); }, {});
  assert.equal(JSON.stringify(await get("profile")), JSON.stringify(defaults.profile));
  assert.equal(calls.length, 0);
});
