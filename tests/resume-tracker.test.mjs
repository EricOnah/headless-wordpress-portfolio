import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const code = ts.transpileModule(readFileSync(new URL("../src/components/resume-tracker.tsx", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function harness(beacon = true) {
  const listeners = new Map();
  const requests = [];
  let cleanup;
  class Element {
    constructor(link) { this.link = link; }
    closest() { return this.link; }
  }
  const context = {
    exports: {}, URL, Blob, Element,
    require: () => ({ useEffect: effect => { cleanup = effect(); } }),
    window: { location: { origin: "https://portfolio.test", pathname: "/projects", search: "?private=value" } },
    navigator: { sendBeacon: (endpoint, body) => {
      if (beacon === "throws") throw new Error("blocked");
      if (beacon) requests.push({ endpoint, body });
      return beacon;
    } },
    fetch: (endpoint, options) => { requests.push({ endpoint, ...options }); return Promise.reject(new Error("offline")); },
    document: {
      addEventListener: (name, handler) => listeners.set(name, handler),
      removeEventListener: name => listeners.delete(name),
    },
  };
  vm.runInNewContext(code, context);
  context.exports.ResumeTracker({ endpoint: "https://cms.test/?rest_route=/portfolio/v1/resume-click", resumeUrl: "/resume.pdf" });
  const click = ({ type = "click", button = 0, href = "https://portfolio.test/resume.pdf", marked = false } = {}) => {
    listeners.get(type)({ type, button, target: new Element({ href, hasAttribute: () => marked }) });
  };
  return { click, requests, listeners, cleanup: () => cleanup() };
}

test("nested resume clicks report the source path without private query values", async () => {
  const h = harness();
  h.click();
  assert.equal(h.requests.length, 1);
  assert.deepEqual(JSON.parse(await h.requests[0].body.text()), { page: "/projects" });
  h.cleanup();
  assert.equal(h.listeners.size, 0);
});

test("normal links and right clicks do not count; middle clicks count once", () => {
  const h = harness();
  h.click({ href: "https://portfolio.test/contact" });
  h.click({ type: "auxclick", button: 2 });
  h.click({ type: "click", button: 1 });
  assert.equal(h.requests.length, 0);
  h.click({ type: "auxclick", button: 1 });
  assert.equal(h.requests.length, 1);
});

test("marked links work with a different CMS resume URL", () => {
  const h = harness();
  h.click({ href: "https://cms.test/uploads/new-resume.pdf", marked: true });
  assert.equal(h.requests.length, 1);
});

for (const beacon of [false, "throws"]) {
  test(`beacon ${beacon} falls back without interrupting navigation`, async () => {
    const h = harness(beacon);
    assert.doesNotThrow(() => h.click());
    await Promise.resolve();
    assert.equal(h.requests.length, 1);
    assert.equal(h.requests[0].keepalive, true);
    assert.equal(h.requests[0].credentials, "omit");
  });
}
