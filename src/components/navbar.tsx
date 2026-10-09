"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./navbar.css";
import type { ProfilePicture } from "@/lib/profile-picture";
import { trackPortfolioEvent } from "@/lib/analytics";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/posts", label: "Posts" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ profilePicture }: { profilePicture: ProfilePicture }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
  const toggleMenu = () => setOpen((prev) => !prev);
  const closeMenu = () => setOpen(false);

  return (
    <>
      <header id="site-header" className="site-header sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-emerald-500/15 ring-1 ring-emerald-300/30 transition hover:ring-emerald-300/60"
              aria-label={"About " + profilePicture.name}
            >
              <img
                src={profilePicture.url}
                alt={profilePicture.alt}
                className="h-full w-full object-cover"
              />
            </Link>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">{profilePicture.name}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">
                {profilePicture.headline}
              </p>
            </div>
          </div>

          <nav id="primary-navigation" aria-label="Main navigation" className="primary-navigation hidden md:block">
            <ul role="list" className="flex items-center gap-6 text-sm font-semibold text-slate-100">
            {navItems.map(({ href, label }) => (
              <li key={href}><Link
                className="portfolio-nav-link"
                href={href}
                aria-current={isCurrent(href) ? "page" : undefined}
              >
                {label}
              </Link></li>
            ))}
            </ul>
          </nav>

          <Link
            href="https://wa.link/eptfzc"
            onClick={() => trackPortfolioEvent("lets_talk_click", "desktop_header")}
        target="_blank"
        rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/30 hover:bg-white/10"
          >
            Let&apos;s talk
            <span aria-hidden>→</span>
          </Link>

          <button
            type="button"
            onClick={toggleMenu}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 p-2 text-white transition hover:border-white/30 hover:bg-white/10 md:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden="true" className="relative block h-4 w-5">
              <span
                className="absolute left-0 top-1/2 h-0.5 w-5 bg-white transition-transform duration-200 ease-in-out motion-reduce:transition-none"
                style={{ transform: open ? "translateY(-50%) rotate(45deg)" : "translateY(calc(-50% - 6px))" }}
              />
              <span
                className="absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 transition-opacity duration-200 ease-in-out motion-reduce:transition-none"
                style={{ opacity: open ? 0 : 1 }}
              >
                <span className={"block h-0.5 w-5 bg-white" + (open ? "" : " animate-pulse-fast motion-reduce:animate-none")} />
              </span>
              <span
                className="absolute left-0 top-1/2 h-0.5 w-5 bg-white transition-transform duration-200 ease-in-out motion-reduce:transition-none"
                style={{ transform: open ? "translateY(-50%) rotate(-45deg)" : "translateY(calc(-50% + 6px))" }}
              />
            </span>
          </button>
        </div>

        <nav hidden={!open} id="mobile-navigation" aria-label="Mobile navigation" className="mobile-navigation md:hidden border-t border-white/10 bg-slate-950/90 backdrop-blur">
            <ul role="list" className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 text-sm font-semibold text-slate-100">
              {navItems.map(({ href, label }) => (
                <li key={href}><Link
                  className="portfolio-nav-link portfolio-nav-link-mobile"
                  href={href}
                  aria-current={isCurrent(href) ? "page" : undefined}
                  onClick={closeMenu}
                >
                  {label}
                </Link></li>
              ))}
            </ul>
        </nav>
      </header>

      <Link
        href="https://wa.link/eptfzc"
        onClick={() => trackPortfolioEvent("lets_talk_click", "mobile_floating")}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_25px_70px_-50px_rgba(16,185,129,0.9)] backdrop-blur transition hover:border-emerald-200 hover:bg-emerald-500/30 md:hidden"
      >
        Let&apos;s talk
        <span aria-hidden>→</span>
      </Link>
    </>
  );
}
