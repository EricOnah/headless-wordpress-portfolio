import Link from "next/link";
import { getContactPageContent } from "@/lib/contact-page";
import { ContactForm } from "@/components/contact-form";

export const revalidate = 300;

export default async function ContactPage() {
  const content = await getContactPageContent();
  const focusItems = content.focus_items.split(/\r?\n/).map(item => item.trim()).filter(Boolean);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main id="main-content" tabIndex={-1} className="contact-page mx-auto max-w-4xl px-6 py-12 space-y-8">
        <header id="contact-intro" className="contact-intro space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
            {content.page_label}
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white">
            {content.heading}
          </h1>
          <p className="text-sm text-slate-200/80">
            {content.introduction}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <ContactForm />

          <section id="direct-lines" aria-labelledby="direct-lines-heading" className="direct-lines space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.9)]">
            <h2 id="direct-lines-heading" className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              {content.direct_lines_label}
            </h2>
            <address className="space-y-4 not-italic">
            <div className="space-y-3 text-sm text-slate-100">
              {content.email ? (
              <Link className="block rounded-xl border border-white/10 bg-black/30 px-4 py-3 transition hover:border-emerald-300/50 hover:bg-black/50" href={`mailto:${content.email}`}>
                <span className="block text-xs uppercase tracking-[0.2em] text-emerald-200">
                  {content.email_label}
                </span>
                {content.email}
              </Link>
              ) : null}
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <span className="block text-xs uppercase tracking-[0.2em] text-emerald-200">
                    {content.phone_label}
                  </span>
                  {content.phone ? (
                  <a
                    href={"tel:" + content.phone.replace(/[^\d+]/g, "")}
                    className="inline-block rounded transition hover:text-emerald-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
                  >
                    {content.phone}
                  </a>
                  ) : null}
                </div>
                {content.whatsapp_url ? (
                <a
                  href={content.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={content.whatsapp_label}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-300/25 transition hover:scale-105 hover:bg-emerald-500/25 hover:text-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300 motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                    <path d="M20.52 3.48A11.87 11.87 0 0 0 12.05 0C5.47 0 .11 5.35.1 11.93c0 2.1.55 4.16 1.6 5.98L0 24l6.24-1.64a11.93 11.93 0 0 0 5.8 1.48h.01c6.58 0 11.94-5.35 11.95-11.93a11.85 11.85 0 0 0-3.48-8.43ZM12.05 21.82h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.22-3.7.97.99-3.61-.24-.37a9.88 9.88 0 0 1-1.52-5.28c0-5.47 4.45-9.92 9.92-9.92a9.85 9.85 0 0 1 7.01 2.9 9.85 9.85 0 0 1 2.9 7.02c0 5.46-4.45 9.9-9.94 9.9Zm5.44-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.8-1.49-1.79-1.66-2.09-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.08 4.5.71.31 1.26.49 1.69.63.71.22 1.35.19 1.86.11.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
                  </svg>
                </a>
                ) : null}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {content.linkedin_url ? (
              <Link
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 transition hover:border-emerald-300/50 hover:bg-black/50"
                href={content.linkedin_url}
                target="_blank"
                rel="noreferrer"
              >
                <span className="block text-xs uppercase tracking-[0.2em] text-emerald-200">
                  {content.linkedin_label}
                </span>
                {content.linkedin_action}
              </Link>
              ) : null}
              {content.github_url ? (
              <Link
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 transition hover:border-emerald-300/50 hover:bg-black/50"
                href={content.github_url}
                target="_blank"
                rel="noreferrer"
              >
                <span className="block text-xs uppercase tracking-[0.2em] text-emerald-200">
                  {content.github_label}
                </span>
                {content.github_action}
              </Link>
              ) : null}
            </div>
            </address>
            <div id="project-focus" className="project-focus rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-xs text-slate-200/90">
              <h3 className="font-semibold text-white">
                {content.focus_heading}
              </h3>
              <ul className="mt-2 space-y-1">
                {focusItems.map((item, index) => <li key={index + ":" + item}>• {item}</li>)}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
