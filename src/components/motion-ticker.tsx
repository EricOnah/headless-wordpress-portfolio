"use client";

import { useEffect, useRef } from "react";
import { parseWorkSignals, type HeroContent } from "@/lib/homepage-hero";

export function MotionTicker({ content }: { content: HeroContent }) {
  const highlights = parseWorkSignals(content.signals_items);
  const viewportRef = useRef<HTMLDivElement>(null);
  const touchingRef = useRef(false);
  const resumeAtRef = useRef(0);
  const writtenPositionRef = useRef(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = viewport?.querySelector<HTMLElement>(".ticker-track");
    if (!viewport || !track || !highlights.length) return;
    const mobile = window.matchMedia("(max-width: 767px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previousTime = 0;

    function tick(now: number) {
      if (!viewport || !track || !mobile.matches || reducedMotion.matches) return;
      const cycle = track.scrollWidth / 3;
      const elapsed = previousTime ? Math.min(now - previousTime, 50) : 0;
      previousTime = now;
      if (cycle > 0 && !touchingRef.current && now >= resumeAtRef.current) {
        const centeredLoop = viewport.scrollWidth - viewport.clientWidth >= cycle * 2;
        const lowerBound = centeredLoop ? cycle : 0;
        const position = lowerBound + ((viewport.scrollLeft - lowerBound + cycle + cycle * elapsed / 52000) % cycle);
        writtenPositionRef.current = position;
        viewport.scrollLeft = position;
        writtenPositionRef.current = viewport.scrollLeft;
      }
      frame = window.requestAnimationFrame(tick);
    }

    function restart() {
      window.cancelAnimationFrame(frame);
      previousTime = 0;
      if (viewport && track && mobile.matches && !reducedMotion.matches) {
        const cycle = track.scrollWidth / 3;
        viewport.scrollLeft = viewport.scrollWidth - viewport.clientWidth >= cycle * 2 ? cycle : 0;
        writtenPositionRef.current = viewport.scrollLeft;
        frame = window.requestAnimationFrame(tick);
      } else if (viewport) {
        viewport.scrollLeft = 0;
        writtenPositionRef.current = 0;
      }
    }

    restart();
    mobile.addEventListener("change", restart);
    reducedMotion.addEventListener("change", restart);
    return () => {
      window.cancelAnimationFrame(frame);
      mobile.removeEventListener("change", restart);
      reducedMotion.removeEventListener("change", restart);
    };
  }, [content.signals_items, highlights.length]);

  function endSwipe() {
    touchingRef.current = false;
    resumeAtRef.current = performance.now() + 1500;
  }

  if (!highlights.length) return null;
  return (
    <section id="work-signals" aria-labelledby="work-signals-heading" className="work-signals motion-ticker relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 shadow-[0_25px_80px_-60px_rgba(0,0,0,0.9)]">
      <div className="ticker-edge absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
      <div className="ticker-edge absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
      <h2 id="work-signals-heading" className="flex items-center gap-3 pb-3 text-xs uppercase tracking-[0.3em] text-emerald-200">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        {content.signals_heading}
      </h2>
      <div
        ref={viewportRef}
        className="ticker-viewport"
        tabIndex={0}
        role="region"
        aria-labelledby="work-signals-heading"
        onPointerDown={() => { touchingRef.current = true; }}
        onPointerUp={endSwipe}
        onPointerCancel={endSwipe}
        onScroll={(event) => {
          if (Math.abs(event.currentTarget.scrollLeft - writtenPositionRef.current) > 1) {
            resumeAtRef.current = performance.now() + 1500;
          }
        }}
        onKeyDown={() => { resumeAtRef.current = performance.now() + 1500; }}
      >
        <ul role="list" className="ticker-track">
          {[...highlights, ...highlights, ...highlights].map((item, idx) => (
            <li
              aria-hidden={idx >= highlights.length}
              key={`${item.title}-${idx}`}
              className={"mx-3 flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm text-emerald-50 ring-1 ring-white/10 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.6)]" + (idx >= highlights.length * 2 ? " ticker-mobile-copy" : "")}
            >
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-100 ring-1 ring-emerald-300/30">
                {item.title}
              </span>
              <span className="text-slate-100/90">{item.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
