import Link from "next/link";
import { person } from "@/lib/content";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{person.name}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
            {person.title}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-slate-100">
          <Link
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 transition hover:border-white/30 hover:bg-white/10"
            href={`mailto:${person.email}`}
          >
            {person.email}
          </Link>
          <Link
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 transition hover:border-white/30 hover:bg-white/10"
            href={`tel:${person.phone}`}
          >
            {person.phone}
          </Link>
          <Link
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 transition hover:border-white/30 hover:bg-white/10"
            href={person.linkedin}
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </Link>
          <Link
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 transition hover:border-white/30 hover:bg-white/10"
            href={person.github}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
