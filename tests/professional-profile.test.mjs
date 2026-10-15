import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const code = ts.transpileModule(readFileSync(new URL("../src/lib/professional-profile.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function harness(profile, offline = false) {
  const context = {
    exports: {}, process: { env: { WORDPRESS_API_URL: "https://cms.example.test" } }, console: { error() {} },
    require(name) {
      if (name === "@/lib/wordpress-content") return { fetchPortfolioContent: async () => {
        if (offline) throw new Error("offline");
        return Response.json([{ profile }]);
      } };
      if (name === "@/lib/wordpress-media") return { secureWordPressMediaUrl: value => value };
      if (name === "@/lib/content") return {
        person: { email: "person@example.test", phone: "123", linkedin: "https://linkedin.com", github: "https://github.com" },
        summary: { body: "Fallback summary", body2: "Fallback second paragraph" },
      };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  vm.runInNewContext(code, context);
  return context.exports.getProfessionalProfile;
}

test("About content and homepage summaries remain independent", async () => {
  const get = harness({ summary_body: "Homepage", summary_body2: "Home second", about_body: "About", about_body2: "About second", about_label: "Meet Eric", about_heading: "Developer", about_contact_heading: "Get in touch" });
  const profile = await get();
  assert.equal(profile.summary_body, "Homepage");
  assert.equal(profile.summary_body2, "Home second");
  assert.equal(profile.about_body, "About");
  assert.equal(profile.about_body2, "About second");
  assert.equal(profile.about_label, "Meet Eric");
  assert.equal(profile.about_heading, "Developer");
  assert.equal(profile.about_contact_heading, "Get in touch");
});

test("existing CMS profiles retain their current About paragraphs until upgraded", async () => {
  const profile = await harness({ summary_body: "Existing introduction", summary_body2: "Existing second paragraph" })();
  assert.equal(profile.about_body, "Existing introduction");
  assert.equal(profile.about_body2, "Existing second paragraph");
  assert.equal(profile.about_heading, "Full-stack Developer | WordPress | Headless CMS");
});

test("clearing an About paragraph leaves the homepage untouched", async () => {
  const profile = await harness({ summary_body: "Keep homepage", about_body: "", about_body2: "" })();
  assert.equal(profile.about_body, "");
  assert.equal(profile.about_body2, "");
  assert.equal(profile.summary_body, "Keep homepage");
});

test("offline CMS retains the original About page content", async () => {
  const profile = await harness({}, true)();
  assert.equal(profile.about_label, "About Eric Onah");
  assert.equal(profile.about_body, "Fallback summary");
  assert.equal(profile.about_body2, "Fallback second paragraph");
});
