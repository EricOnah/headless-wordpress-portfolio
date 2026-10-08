import Link from "next/link";
import type { HeroContent } from "@/lib/homepage-hero";

export function HeroSection({ content }: { content: HeroContent }) {
  return (
    <section id="hero" aria-labelledby="hero-heading" className="hero grid min-h-[520px] gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.8)] lg:min-h-[500px] lg:grid-cols-2 lg:items-center">
      <header id="hero-intro" className="hero-intro space-y-6">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
          {content.label}
        </p>
        <div className="space-y-3">
          <h1 id="hero-heading" className="text-[2rem] font-semibold leading-tight text-white">
            {content.name}
          </h1>
          <p className="text-lg font-semibold text-emerald-100">
            {content.role}
          </p>
          <p className="text-sm text-slate-200/85">{content.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {content.primary_url && content.primary_label ? (
          <Link href={content.primary_url} className="btn-white-dark">
            {content.primary_label}
            <span aria-hidden>→</span>
          </Link>
          ) : null}
          {content.secondary_url && content.secondary_label ? (
          <Link
            href={content.secondary_url}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
          >
            {content.secondary_label}
          </Link>
          ) : null}
        </div>

      </header>

      <figure id="hero-visual" className="hero-visual relative overflow-hidden rounded-2xl border border-white/10 bg-black/30">
        <img
          src={content.image_url}
          alt={content.image_alt}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        <figcaption className="hero-caption absolute bottom-4 left-1/2 mt-2 -translate-x-1/2 space-y-1 rounded-2xl bg-black/60 px-6 py-4 text-center text-xs text-slate-100 ring-1 ring-white/10 min-w-[340px]">
          <p className="font-semibold text-emerald-200">
            {content.caption_heading}
          </p>
          <p>{content.caption_body}</p>
        </figcaption>
      </figure>
    </section>
  );
}
