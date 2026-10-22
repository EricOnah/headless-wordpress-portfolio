import { getButtonLabels } from "@/lib/button-labels";
import { getLighthouseReports, type Report, type Strategy } from "@/lib/lighthouse-reports";

const labels = { performance: "Performance", accessibility: "Accessibility", "best-practices": "Best Practices", seo: "SEO" };

export async function LighthouseScores() {
  const [labels, reports] = await Promise.all([getButtonLabels("footer"), getLighthouseReports()]);
  return (
    <div className="mx-auto max-w-6xl border-t border-white/10 px-6 py-6 text-xs text-slate-300">
      <div className="md:hidden"><ScoreReport linkLabel={labels.pagespeed_label} strategy="mobile" report={reports.mobile} /></div>
      <div className="hidden md:block"><ScoreReport linkLabel={labels.pagespeed_label} strategy="desktop" report={reports.desktop} /></div>
    </div>
  );
}

function ScoreReport({ strategy, report, linkLabel }: { strategy: Strategy; report?: Report; linkLabel: string }) {
  const site = report?.url || "https://ericonah.online/";
  const link = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(site)}&form_factor=${strategy}`;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-semibold text-slate-100">Lighthouse · {strategy === "desktop" ? "Desktop" : "Mobile"} homepage</p>
        <a href={link} target="_blank" rel="noopener noreferrer" className="py-2 text-emerald-200 hover:text-emerald-100">{linkLabel} ↗</a>
      </div>
      {report ? (
        <>
          <dl className="mt-3 flex flex-wrap gap-3">
            {Object.entries(labels).map(([key, label]) => {
              const score = report.scores[key as keyof typeof labels];
              const color = score >= 90 ? "text-emerald-200" : score >= 50 ? "text-amber-200" : "text-red-300";
              return <div key={key} className="flex items-center gap-3 rounded-full border border-white/10 px-4 py-2"><dt>{label}</dt><dd className={`font-semibold ${color}`}>{score}<span className="text-slate-400">/100</span></dd></div>;
            })}
          </dl>
          <p className="mt-3 text-slate-400">Saved audit · <time dateTime={report.auditedAt}>{new Date(report.auditedAt).toISOString().slice(0, 16).replace("T", " ")} UTC</time> · Lab scores vary between runs.</p>
        </>
      ) : null}
    </>
  );
}
