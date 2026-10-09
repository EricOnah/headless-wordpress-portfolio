import { readFile, writeFile, mkdir } from "node:fs/promises";

const file = new URL("../public/lighthouse-score.json", import.meta.url);
const categories = ["performance", "accessibility", "best-practices", "seo"];
const site = process.env.LIGHTHOUSE_SITE_URL || "https://ericonah.online/";
let saved = { reports: {} };
try {
  const previous = JSON.parse(await readFile(file, "utf8"));
  saved.reports = previous.reports || (previous.report ? { [previous.report.strategy]: previous.report } : {});
} catch { /* First build. */ }

if (process.env.PAGESPEED_API_KEY && (process.env.VERCEL_ENV === "production" || process.argv.includes("--refresh"))) {
  const results = await Promise.allSettled(["mobile", "desktop"].map(async (strategy) => {
    const target = new URL(site);
    if (target.protocol !== "https:") throw new Error("HTTPS required");
    const url = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    url.searchParams.set("url", target.href);
    url.searchParams.set("strategy", strategy);
    url.searchParams.set("key", process.env.PAGESPEED_API_KEY);
    for (const category of categories) url.searchParams.append("category", category);
    const response = await fetch(url, { signal: AbortSignal.timeout(90000) });
    if (!response.ok) throw new Error("Audit request failed");
    const { lighthouseResult: result } = await response.json();
    if (result?.runtimeError || !Number.isFinite(Date.parse(result?.fetchTime))) throw new Error("Incomplete audit");
    const scores = {};
    for (const category of categories) {
      const score = result.categories?.[category]?.score;
      if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 1) throw new Error("Invalid score");
      scores[category] = Math.round(score * 100);
    }
    return { url: target.href, strategy, auditedAt: result.fetchTime, scores };
  }));
  for (const [index, result] of results.entries()) {
    const strategy = ["mobile", "desktop"][index];
    if (result.status === "fulfilled") {
      saved.reports[strategy] = result.value;
      console.log(`Lighthouse ${strategy} footer scores updated.`);
    } else {
      // Never log the request URL or API key, and never prevent deployment.
      console.warn(`Lighthouse ${strategy} audit unavailable; retaining its previous report if present.`);
    }
  }
}
await mkdir(new URL("../public/", import.meta.url), { recursive: true });
await writeFile(file, JSON.stringify(saved, null, 2) + "\n");
