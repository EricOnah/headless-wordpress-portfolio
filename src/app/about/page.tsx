/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { SkillsGrid } from "@/components/skills-grid";
import { person, summary, certifications, education } from "@/lib/content";

export const revalidate = 300;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-10">
        <div className="grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.8)] lg:grid-cols-5 lg:items-center">
          <div className="lg:col-span-3 space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              About Eric Onah
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white">
            Full-stack Developer | WordPress | Headless CMS
          </h1>
            <p className="text-base text-slate-100">{summary.body}</p>
            <p className="text-base text-slate-100">{summary.body2}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn-white-dark">
                Work together
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
              >
                View portfolio
              </Link>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              <img
                src="/placeholders/about.png"
                alt="Portrait and workspace illustration for Eric Onah"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-slate-200/90">
              <p className="font-semibold text-white">Contact</p>
              <p>{person.email}</p>
              <p>{person.phone}</p>
              <div className="mt-2 flex gap-2 text-emerald-100">
                <Link href={person.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </Link>
                <span aria-hidden>•</span>
                <Link href={person.github} target="_blank" rel="noreferrer">
                  GitHub
                </Link>
              </div>
            </div>
          </div>
        </div>

        <SkillsGrid />

        <ExperienceTimeline />

        <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.9)] lg:grid-cols-2 lg:items-start">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              Education
            </p>
            <h2 className="text-2xl font-semibold text-white">
              Academic foundation
            </h2>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-slate-100">
              <p className="font-semibold text-white">{education.degree}</p>
              <p className="text-emerald-100">{education.school}</p>
              <p className="text-slate-300/80">{education.period}</p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              Certifications
            </p>
            <h2 className="text-2xl font-semibold text-white">
              Proof of capability
            </h2>
            <div className="grid gap-3">
              {certifications.map((cert) => (
                <div
                  key={cert}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100"
                >
                  <span>{cert}</span>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-100 ring-1 ring-emerald-200/40">
                    Earned
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
