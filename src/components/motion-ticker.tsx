const highlights = [
  { title: "Headless launch", detail: "Next.js + WordPress checkout tuned for spikes" },
  { title: "SEO uplift", detail: "Core Web Vitals green across mobile and desktop" },
  { title: "API hardening", detail: "Custom endpoints with caching + auth for partners" },
  { title: "Editor flow", detail: "Live preview + structured blocks for faster publishing" },
  { title: "Performance", detail: "Edge caching and ISR for sub-second navigation" },
  { title: "Security", detail: "WAF rules, 2FA, and dependency audits each release" },
];

export function MotionTicker() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 shadow-[0_25px_80px_-60px_rgba(0,0,0,0.9)]">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
      <div className="flex items-center gap-3 pb-3 text-xs uppercase tracking-[0.3em] text-emerald-200">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        Moving work signals
      </div>
      <div className="ticker-viewport">
        <div className="ticker-track">
          {[...highlights, ...highlights].map((item, idx) => (
            <div
              key={`${item.title}-${idx}`}
              className="mx-3 flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm text-emerald-50 ring-1 ring-white/10 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.6)]"
            >
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-100 ring-1 ring-emerald-300/30">
                {item.title}
              </span>
              <span className="text-slate-100/90">{item.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
