/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { HeroSection } from "@/components/hero-section";
import { SkillsGrid } from "@/components/skills-grid";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { PortfolioProjectsSection } from "@/components/portfolio-projects-section";
import { MotionTicker } from "@/components/motion-ticker";
import { person } from "@/lib/content";
import { getHeroContent } from "@/lib/homepage-hero";
import { getProfessionalProfile } from "@/lib/professional-profile";

export const revalidate = 300;

export default async function Home() {
  const [profile, hero] = await Promise.all([getProfessionalProfile(), getHeroContent()]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main id="main-content" tabIndex={-1} className="home-page mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12">
        <div className="animate-fade-up">
          <HeroSection content={hero} />
        </div>

        <div className="animate-fade-up animate-delay-1">
          <MotionTicker content={hero} />
        </div>

        <section id="professional-summary" aria-labelledby="professional-summary-heading" className="professional-summary animate-fade-up animate-delay-2 grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.8)] lg:grid-cols-5 lg:items-start">
          <div className="lg:col-span-3 space-y-4">
            <h2 id="professional-summary-heading" className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              {profile.summary_heading}
            </h2>
            <p className="text-base text-slate-100">{profile.summary_body}</p>
            <p className="text-base text-slate-100">{profile.summary_body2}</p>
          </div>
          <div id="profile-contact" className="profile-contact w-full max-w-sm justify-self-center self-center lg:col-span-2 space-y-4 rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Contact</h3>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-100 ring-1 ring-emerald-200/40">
                {profile.availability}
              </span>
            </div>
            <address className="space-y-2 text-sm text-slate-100 not-italic">
              <Link className="block hover:text-emerald-200" href={`mailto:${profile.email}`}>
                {profile.email}
              </Link>
              <Link className="block hover:text-emerald-200" href={`tel:${profile.phone}`}>
                {profile.phone}
              </Link>
              <Link className="block hover:text-emerald-200" href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </Link>
              <Link className="block hover:text-emerald-200" href={profile.github} target="_blank" rel="noreferrer">
                GitHub
              </Link>
            </address>
            {profile.resume_url ? (
                <a
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-500/15 px-4 py-2 font-semibold text-emerald-100 transition hover:bg-emerald-500/25"
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View resume <span aria-hidden>↗</span>
                </a>
            ) : null}

          </div>
        </section>

        <div className="animate-fade-up">
          <SkillsGrid />
        </div>

        <div className="animate-fade-up animate-delay-1">
          <ExperienceTimeline />
        </div>

        <PortfolioProjectsSection featuredOnly />

        <section id="contact" aria-labelledby="home-contact-heading" className="contact-cta animate-fade-up animate-delay-1 grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.9)] lg:grid-cols-2 lg:items-center">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              Contact
            </p>
            <h2 id="home-contact-heading" className="text-xl font-semibold text-white">
              Need a headless WordPress build?
            </h2>
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
              src="/api/wordpress-media/2026/10/contact-code-1024x683.jpg"
              alt="Close-up of code on a screen"
              width={1024}
              height={683}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
