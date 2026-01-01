import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-black text-slate-50">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 px-6 py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Missing</p>
        <h1 className="text-3xl font-semibold text-white">Project not found</h1>
        <p className="text-sm text-slate-200/80">
          We couldn&apos;t locate that case study. If it lives in WordPress, confirm the slug and try again.
        </p>
        <Link
          href="/projects"
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/30 hover:bg-white/10"
        >
          <span aria-hidden>←</span>
          Back to projects
        </Link>
      </div>
    </div>
  );
}
