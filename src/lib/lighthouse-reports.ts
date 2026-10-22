import { readFile } from "node:fs/promises";
import path from "node:path";

export type Strategy = "mobile" | "desktop";
const categories = ["performance", "accessibility", "best-practices", "seo"] as const;
export type Report = { url: string; strategy: Strategy; auditedAt: string; scores: Record<typeof categories[number], number> };
type Reports = Partial<Record<Strategy, Report>>;

function parseReports(saved: unknown): Reports {
  const reports: Reports = {};
  if (!saved || typeof saved !== "object") return reports;
  const data = saved as { reports?: Reports; report?: Report };
  const candidates = data.reports || (data.report ? { [data.report.strategy]: data.report } : {});
  for (const strategy of ["mobile", "desktop"] as const) {
    const report = candidates[strategy];
    if (!report || report.strategy !== strategy || !Number.isFinite(Date.parse(report.auditedAt))) continue;
    try { if (new URL(report.url).protocol !== "https:") continue; } catch { continue; }
    if (!categories.every(key => typeof report.scores?.[key] === "number" && Number.isFinite(report.scores[key]) && report.scores[key] >= 0 && report.scores[key] <= 100)) continue;
    reports[strategy] = report;
  }
  return reports;
}

export async function getLighthouseReports(): Promise<Reports> {
  let reports: Reports = {};
  try {
    reports = parseReports(JSON.parse(await readFile(path.join(process.cwd(), "public/lighthouse-score.json"), "utf8")));
  } catch { /* Optional build snapshot during backend rollout. */ }
  const base = (process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "")
    .replace(/\/$/, "").replace(/\/wp-json$/, "");
  if (base) {
    try {
      const response = await fetch(`${base}/?rest_route=/portfolio/v1/lighthouse`, {
        cache: "no-store", signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const scheduled = parseReports(await response.json());
        for (const strategy of ["mobile", "desktop"] as const) {
          const candidate = scheduled[strategy];
          if (candidate && (!reports[strategy] || Date.parse(candidate.auditedAt) >= Date.parse(reports[strategy]!.auditedAt))) reports[strategy] = candidate;
        }
      }
    } catch { /* Keep the build snapshot if the CMS is unavailable. */ }
  }
  return reports;
}
