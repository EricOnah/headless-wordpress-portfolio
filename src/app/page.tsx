/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { HeroSection } from "@/components/hero-section";
import { SkillsGrid } from "@/components/skills-grid";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { ProjectCard } from "@/components/project-card";
import { MotionTicker } from "@/components/motion-ticker";
import { person, summary, certifications } from "@/lib/content";
import { getPosts, getProjects, hasWordPressSource } from "@/lib/wordpress";

export const revalidate = 300;

export default async function Home() {
  const [projects, posts] = await Promise.all([getProjects(6), getPosts(4)]);
  const usingManual = !hasWordPressSource;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12">
        <div className="animate-fade-up">
          <HeroSection />
        </div>

        <div className="animate-fade-up animate-delay-1">
          <MotionTicker />
        </div>

        <section className="animate-fade-up animate-delay-2 grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.8)] lg:grid-cols-5 lg:items-start">
          <div className="lg:col-span-3 space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              Professional Summary
            </p>
            <p className="text-base text-slate-100">{summary.body}</p>
            <p className="text-base text-slate-100">{summary.body2}</p>
          </div>
          <div className="lg:col-span-2 space-y-4 rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Contact</p>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-100 ring-1 ring-emerald-200/40">
                Available
              </span>
            </div>
            <div className="space-y-2 text-sm text-slate-100">
              <Link className="block hover:text-emerald-200" href={`mailto:${person.email}`}>
                {person.email}
              </Link>
              <Link className="block hover:text-emerald-200" href={`tel:${person.phone}`}>
                {person.phone}
              </Link>
              <Link className="block hover:text-emerald-200" href={person.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </Link>
              <Link className="block hover:text-emerald-200" href={person.github} target="_blank" rel="noreferrer">
                GitHub
              </Link>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-200/90">
              <p className="font-semibold text-white">Certifications</p>
              <ul className="mt-2 space-y-1">
                {certifications.map((cert) => (
                  <li key={cert} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="animate-fade-up">
          <SkillsGrid />
        </div>

        <div className="animate-fade-up animate-delay-1">
          <ExperienceTimeline compact />
        </div>

        <section id="projects" className="animate-fade-up animate-delay-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                Projects
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Featured WordPress & headless builds
              </h2>
            </div>
            <Link
              href="/projects"
              className="text-sm font-semibold text-emerald-200"
            >
              See all
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        <section className="animate-fade-up animate-delay-3 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                Posts
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Latest WordPress notes
              </h2>
            </div>
            <Link
              href="/posts"
              className="text-sm font-semibold text-emerald-200"
            >
              See all
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <ProjectCard key={post.id} project={post} hrefBase="/posts" />
            ))}
          </div>
        </section>

        <section className="animate-fade-up animate-delay-1 grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.9)] lg:grid-cols-2 lg:items-center">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              Contact
            </p>
            <h3 className="text-xl font-semibold text-white">
              Need a headless WordPress build?
            </h3>
            <p className="text-sm text-slate-200/80">
              Let&apos;s scope the right mix of custom themes, APIs, and React for your next launch.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn-white-dark">
                Start a project
                <span aria-hidden>→</span>
              </Link>
              <Link
                href={`mailto:${person.email}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
              >
                Email {person.name.split(" ")[0]}
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <img
              src="/placeholders/contact.png"
              alt="Contact form and communication tools illustration"
              className="h-full w-full object-cover"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
