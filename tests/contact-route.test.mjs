import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isIP } from "node:net";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Run the actual route with isolated environment, SMTP, clock, and HTTP mocks.
// No credentials are read and no network requests or emails are sent.
function compile(path) {
  return ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
}
const routeCode = compile("../src/app/api/contact/route.ts");
const optionsCode = compile("../src/lib/contact-options.ts");
function harness(overrides = {}, verification = {}, sendError) {
  const emails = [];
  const verifications = [];
  let connections = 0;
  let now = Date.now();
  const options = { exports: {} };
  vm.runInNewContext(optionsCode, options);
  const context = {
    exports: {}, Buffer, Request, Response, AbortSignal, URL,
    Date: class extends Date { static now() { return now; } },
    console: { error() {} },
    process: { env: {
      VERCEL: "1", SMTP_HOST: "smtp.example.test", SMTP_PORT: "587",
      SMTP_USER: "sender@example.test", SMTP_PASS: "fake-password", ...overrides,
    } },
    fetch: async (url, init) => {
      verifications.push({ url, body: JSON.parse(init.body) });
      if (verification instanceof Error) throw verification;
      return Response.json(verification);
    },
    require: name => {
      if (name === "node:net") return { isIP };
      if (name === "@/lib/contact-options") return options.exports;
      if (name === "nodemailer") return { createTransport: () => {
        connections += 1;
        return { close() {}, sendMail: async mail => {
          if (sendError) throw sendError;
          emails.push(mail);
        } };
      } };
      throw new Error(`Unexpected import: ${name}`);
    },
  };
  vm.runInNewContext(routeCode, context);
  return {
    emails, verifications,
    connections: () => connections,
    advance: ms => { now += ms; },
    submit: (body, headers = {}) => context.exports.POST(new Request("https://ericonah.online/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-vercel-forwarded-for": "203.0.113.7", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })),
  };
}
const valid = {
  name: "Ada Example", email: "ada@example.test", projectType: "WordPress build",
  details: "Please build a portfolio website.\nTimeline: next month.", companyWebsite: "",
};

test("valid request sends plain text once to the configured recipient", async () => {
  const h = harness({ CONTACT_TO: "owner@example.test" });
  const response = await h.submit(valid, { origin: "https://ericonah.online" });
  assert.equal(response.status, 200);
  assert.equal(h.emails.length, 1);
  assert.equal(h.emails[0].to, "owner@example.test");
  assert.equal(h.emails[0].replyTo.address, valid.email);
  assert.equal(h.emails[0].html, undefined);
});

test("honeypot accepts without opening SMTP", async () => {
  const h = harness();
  assert.equal((await h.submit({ ...valid, companyWebsite: "spam.test" })).status, 200);
  assert.equal(h.connections(), 0);
});

for (const [label, body] of [
  ["malformed JSON", "{"], ["null body", "null"], ["array", []],
  ["missing fields", {}], ["object field", { ...valid, name: {} }],
  ["empty details", { ...valid, details: "  " }],
  ["multiple email recipients", { ...valid, email: "a@example.test,b@example.test" }],
  ["email header injection", { ...valid, email: "ada@example.test\r\nBcc: other@example.test" }],
  ["name header injection", { ...valid, name: "Ada\nBcc:other" }],
  ["invalid email", { ...valid, email: "not-an-email" }],
  ["invalid email dots", { ...valid, email: "a..b@example.test" }],
  ["unknown project", { ...valid, projectType: "Injected subject" }],
  ["long name", { ...valid, name: "A".repeat(101) }],
  ["long details", { ...valid, details: "A".repeat(5001) }],
]) test(`rejects ${label} before SMTP`, async () => {
  const h = harness();
  assert.equal((await h.submit(body)).status, 400);
  assert.equal(h.connections(), 0);
});

test("accepts field-length boundary and multiline details", async () => {
  const h = harness();
  assert.equal((await h.submit({ ...valid, name: "A".repeat(100), details: "A".repeat(5000) })).status, 200);
});

test("rejects oversized streamed body without relying on content-length", async () => {
  const h = harness();
  assert.equal((await h.submit({ ...valid, extra: "😀".repeat(9000) })).status, 413);
  assert.equal(h.connections(), 0);
});

test("rejects oversized declared length and wrong content type", async () => {
  const h = harness();
  assert.equal((await h.submit(valid, { "content-length": "40000" })).status, 413);
  assert.equal((await h.submit(valid, { "content-type": "text/plain" })).status, 415);
  assert.equal(h.connections(), 0);
});

test("rejects cross-origin and cross-site requests", async () => {
  const h = harness();
  assert.equal((await h.submit(valid, { origin: "https://spam.test" })).status, 403);
  assert.equal((await h.submit(valid, { "sec-fetch-site": "cross-site" })).status, 403);
  assert.equal(h.connections(), 0);
});

test("sixth attempt is limited; spoofed forwarding does not evade it; window expires", async () => {
  const h = harness();
  for (let n = 0; n < 5; n++) assert.equal((await h.submit({})).status, 400);
  const response = await h.submit(valid, { "x-forwarded-for": "192.0.2.1" });
  assert.equal(response.status, 429);
  assert.ok(Number(response.headers.get("retry-after")) > 0);
  assert.equal(h.connections(), 0);
  h.advance(600_001);
  assert.equal((await h.submit(valid)).status, 200);
});

const keys = { NEXT_PUBLIC_TURNSTILE_SITE_KEY: "fake-site", TURNSTILE_SECRET_KEY: "fake-secret" };
test("partial Turnstile configuration and missing tokens fail closed", async () => {
  for (const env of [{ TURNSTILE_SECRET_KEY: "fake" }, { NEXT_PUBLIC_TURNSTILE_SITE_KEY: "fake" }]) {
    const h = harness(env);
    assert.equal((await h.submit(valid)).status, 503);
    assert.equal(h.connections(), 0);
  }
  const h = harness(keys);
  assert.equal((await h.submit(valid)).status, 400);
  assert.equal(h.verifications.length, 0);
});

for (const result of [
  { success: false },
  { success: true, hostname: "spam.test", action: "contact" },
  { success: true, hostname: "ericonah.online", action: "other" },
]) test(`rejects invalid Turnstile result ${JSON.stringify(result)}`, async () => {
  const h = harness(keys, result);
  assert.equal((await h.submit({ ...valid, turnstileToken: "token" })).status, 400);
  assert.equal(h.connections(), 0);
});

test("verified token allows delivery and verification receives the trusted IP", async () => {
  const h = harness(keys, { success: true, hostname: "ericonah.online", action: "contact" });
  assert.equal((await h.submit({ ...valid, turnstileToken: "token" })).status, 200);
  assert.equal(h.verifications[0].body.remoteip, "203.0.113.7");
  assert.equal(h.emails.length, 1);
});

test("verification outage fails closed", async () => {
  const h = harness(keys, new Error("network failure"));
  assert.equal((await h.submit({ ...valid, turnstileToken: "token" })).status, 503);
  assert.equal(h.connections(), 0);
});

test("SMTP configuration and delivery errors expose no secrets", async () => {
  const missing = harness({ SMTP_PASS: "" });
  assert.equal((await missing.submit(valid)).status, 503);
  assert.equal(missing.connections(), 0);
  const h = harness({}, {}, Object.assign(new Error("secret SMTP details"), { code: "EAUTH" }));
  const response = await h.submit(valid);
  assert.equal(response.status, 502);
  assert.equal((await response.text()).includes("secret SMTP details"), false);
});
