import Link from "next/link";
import { person } from "@/lib/content";
import { ContactForm } from "@/components/contact-form";
import { ProjectTypeSelect } from "@/components/project-type-select";

export const revalidate = 300;

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
            Contact
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white">
            Let&apos;s build your next WordPress or headless experience
          </h1>
          <p className="text-sm text-slate-200/80">
            Whether you need a secure WordPress site, a custom plugin, or a headless React/Next.js front-end, I can help scope, ship, and
            optimize it.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ContactForm />

          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.9)]">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              Direct lines
            </p>
            <div className="space-y-3 text-sm text-slate-100">
              <Link className="block rounded-xl border border-white/10 bg-black/30 px-4 py-3 transition hover:border-emerald-300/50 hover:bg-black/50" href={`mailto:${person.email}`}>
                <span className="block text-xs uppercase tracking-[0.2em] text-emerald-200">
                  Email
                </span>
                {person.email}
              </Link>
              <Link className="block rounded-xl border border-white/10 bg-black/30 px-4 py-3 transition hover:border-emerald-300/50 hover:bg-black/50" href={`tel:${person.phone}`}>
                <span className="block text-xs uppercase tracking-[0.2em] text-emerald-200">
                  Phone / WhatsApp
                </span>
                {person.phone}
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 transition hover:border-emerald-300/50 hover:bg-black/50"
                href={person.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                <span className="block text-xs uppercase tracking-[0.2em] text-emerald-200">
                  LinkedIn
                </span>
                Connect
              </Link>
              <Link
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 transition hover:border-emerald-300/50 hover:bg-black/50"
                href={person.github}
                target="_blank"
                rel="noreferrer"
              >
                <span className="block text-xs uppercase tracking-[0.2em] text-emerald-200">
                  GitHub
                </span>
                View code
              </Link>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-xs text-slate-200/90">
              <p className="font-semibold text-white">
                Projects I focus on:
              </p>
              <ul className="mt-2 space-y-1">
                <li>• Custom WordPress themes & plugins</li>
                <li>• Headless WordPress with Next.js or React</li>
                <li>• API integrations, payments, and workflows</li>
                <li>• Performance, security, and SEO improvements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
