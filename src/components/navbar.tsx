 "use client";

import { useState } from "react";
import Link from "next/link";
import { person } from "@/lib/content";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const wordpressBaseUrl =
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL
      ?.replace(/\/$/, "")
      .replace(/\/wp-json$/, "") ||
    "http://wordpress-portfolio.ddev.site";
  const profileImageUrl = `${wordpressBaseUrl}/app/uploads/2025/12/eric-dp.webp`;

  const toggleMenu = () => setOpen((prev) => !prev);
  const closeMenu = () => setOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-emerald-500/15 ring-1 ring-emerald-300/30 transition hover:ring-emerald-300/60"
              aria-label="Go to home"
            >
              <img
                src={profileImageUrl}
                alt={`${person.name} profile`}
                className="h-full w-full object-cover"
              />
            </Link>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">{person.name}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">
                {person.title}
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-100 md:flex">
            <Link className="hover:text-emerald-200" href="/">
              Home
            </Link>
            <Link className="hover:text-emerald-200" href="/about">
              About
            </Link>
            <Link className="hover:text-emerald-200" href="/projects">
              Projects
            </Link>
            <Link className="hover:text-emerald-200" href="/posts">
              Posts
            </Link>
            <Link className="hover:text-emerald-200" href="/contact">
              Contact
            </Link>
          </nav>

          <Link
            href={`mailto:${person.email}`}
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/30 hover:bg-white/10"
          >
            Let&apos;s talk
            <span aria-hidden>→</span>
          </Link>

          <button
            type="button"
            onClick={toggleMenu}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 p-2 text-white transition hover:border-white/30 hover:bg-white/10 md:hidden"
            aria-label="Toggle navigation"
          >
            <span className="sr-only">Toggle menu</span>
            <div className="flex flex-col gap-1">
              <span className="h-0.5 w-5 bg-white origin-center transition duration-200 ease-in-out" />
              <span className="h-0.5 w-5 bg-white origin-center transition duration-200 ease-in-out animate-pulse-fast" />
              <span className="h-0.5 w-5 bg-white origin-center transition duration-200 ease-in-out" />
            </div>
          </button>
        </div>

        {open ? (
          <div className="md:hidden border-t border-white/10 bg-slate-950/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 text-sm font-semibold text-slate-100">
              <Link className="hover:text-emerald-200" href="/" onClick={closeMenu}>
                Home
              </Link>
              <Link className="hover:text-emerald-200" href="/about" onClick={closeMenu}>
                About
              </Link>
              <Link className="hover:text-emerald-200" href="/projects" onClick={closeMenu}>
                Projects
              </Link>
              <Link className="hover:text-emerald-200" href="/posts" onClick={closeMenu}>
                Posts
              </Link>
              <Link className="hover:text-emerald-200" href="/contact" onClick={closeMenu}>
                Contact
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <Link
        href={`mailto:${person.email}`}
        className="fixed bottom-6 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_25px_70px_-50px_rgba(16,185,129,0.9)] backdrop-blur transition hover:border-emerald-200 hover:bg-emerald-500/30 md:hidden"
      >
        Let&apos;s talk
        <span aria-hidden>→</span>
      </Link>
    </>
  );
}
