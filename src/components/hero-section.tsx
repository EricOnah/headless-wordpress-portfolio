import Link from "next/link";
import { person, summary } from "@/lib/content";

export function HeroSection() {
  return (
    <section className="grid min-h-[520px] gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.8)] lg:min-h-[500px] lg:grid-cols-2 lg:items-center">
      <div className="space-y-6">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
          Headless WordPress Portfolio
        </p>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold leading-tight text-white lg:text-5xl">
            {person.name}
          </h1>
          <p className="text-lg font-semibold text-emerald-100">
            {person.title}
          </p>
          <p className="text-sm text-slate-200/85">{summary.headline}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/projects" className="btn-white-dark">
            View projects
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
          >
            Book a build
          </Link>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
          <Link
            href="/posts/wordpress-scalable-stacks"
            className="rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/10 transition hover:bg-white/15 hover:text-emerald-200"
          >
            WordPress
          </Link>
          <Link
            href="/posts/headless-cms-playbook"
            className="rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/10 transition hover:bg-white/15 hover:text-emerald-200"
          >
            Headless CMS
          </Link>
          <Link
            href="/posts/nextjs-for-wordpress"
            className="rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/10 transition hover:bg-white/15 hover:text-emerald-200"
          >
            Next.js
          </Link>
          <Link
            href="/posts/rest-api-architecture"
            className="rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/10 transition hover:bg-white/15 hover:text-emerald-200"
          >
            REST API
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30">
        <img
          src="/placeholders/wp-next-hero.svg"
          alt="WordPress and Next.js working together for headless builds"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-1/2 mt-2 -translate-x-1/2 space-y-1 rounded-2xl bg-black/60 px-6 py-4 text-center text-xs text-slate-100 ring-1 ring-white/10 min-w-[340px]">
          <p className="font-semibold text-emerald-200">
            WordPress + Next.js builds
          </p>
          <p>Custom themes, REST APIs, performance tuning, security, and SEO.</p>
        </div>
      </div>
    </section>
  );
}
