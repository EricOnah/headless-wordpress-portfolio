/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { SkillsGrid } from "@/components/skills-grid";
import { getEducationProfile } from "@/lib/education-profile";
import { getProfessionalProfile } from "@/lib/professional-profile";
import { getProfilePicture } from "@/lib/profile-picture";

export const revalidate = 300;

export default async function AboutPage() {
  const [profile, profilePicture, educationProfile] = await Promise.all([
    getProfessionalProfile(),
    getProfilePicture(),
    getEducationProfile(),
  ]);
  const certificationItems = educationProfile.certifications.split(/\r?\n/).map(item => item.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main id="main-content" tabIndex={-1} className="about-page mx-auto max-w-6xl px-6 py-12 space-y-10">
        <section id="about" aria-labelledby="about-heading" className="about grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.8)] lg:grid-cols-5 lg:items-center">
          <div className="lg:col-span-3 space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              About Eric Onah
            </p>
            <h1 id="about-heading" className="text-4xl font-semibold leading-tight text-white">
            Full-stack Developer | WordPress | Headless CMS
          </h1>
            <p className="text-base text-slate-100">{profile.summary_body}</p>
            <p className="text-base text-slate-100">{profile.summary_body2}</p>
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
                src={profilePicture.url}
                alt={profilePicture.alt}
                className="h-full w-full object-cover"
              />
            </div>
            <address id="about-contact" className="about-contact not-italic mt-4 rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-slate-200/90">
              <p className="font-semibold text-white">Contact</p>
              <p>{profile.email}</p>
              <p>{profile.phone}</p>
              <div className="mt-2 flex gap-2 text-emerald-100">
                <Link href={profile.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </Link>
                <span aria-hidden>•</span>
                <Link href={profile.github} target="_blank" rel="noreferrer">
                  GitHub
                </Link>
              </div>
            </address>
          </div>
        </section>

        <SkillsGrid />

        <ExperienceTimeline />

        <section id="education-certifications" aria-label="Education and certifications" className="education-certifications grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.9)] lg:grid-cols-2 lg:items-start">
          <div id="education" className="education space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              {educationProfile.education_label}
            </p>
            <h2 className="text-2xl font-semibold text-white">
              {educationProfile.education_heading}
            </h2>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-slate-100">
              <p className="font-semibold text-white">{educationProfile.degree}</p>
              <p className="text-emerald-100">{educationProfile.school}</p>
              <p className="text-slate-300/80">{educationProfile.period}</p>
            </div>
          </div>
          <div id="certifications" className="certifications space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              {educationProfile.certifications_label}
            </p>
            <h2 className="text-2xl font-semibold text-white">
              {educationProfile.certifications_heading}
            </h2>
            <ul role="list" className="grid gap-3">
              {certificationItems.map((cert, index) => (
                <li
                  key={index + ":" + cert}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100"
                >
                  <span>{cert}</span>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-100 ring-1 ring-emerald-200/40">
                    {educationProfile.certification_status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
