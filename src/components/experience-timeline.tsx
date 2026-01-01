 "use client";

import { useState } from "react";
import { experiences } from "@/lib/content";

export function ExperienceTimeline({ compact = false }: { compact?: boolean }) {
  const items = compact ? experiences.slice(0, 3) : experiences;
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
          Experience
        </p>
        <h2 className="text-2xl font-semibold text-white">
          WordPress and headless roles
        </h2>
      </div>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.role}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.8)]"
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-cyan-300" />
            <div className="pl-4">
              <button
                type="button"
                onClick={() => toggle(item.role)}
                className="flex w-full cursor-pointer flex-col gap-1 text-left sm:flex-row sm:items-center sm:justify-between"
                aria-expanded={Boolean(openMap[item.role])}
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {item.role}
                  </p>
                  <p className="text-sm text-emerald-100">{item.company}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300/80">
                    {item.period}
                  </p>
                  <span className="text-[10px] text-emerald-200">
                    {openMap[item.role] ? "▾" : "▸"}
                  </span>
                </div>
              </button>
              {openMap[item.role] ? (
                <>
                  {item.location ? (
                    <p className="mt-1 text-xs text-slate-300/80">{item.location}</p>
                  ) : null}
                  <ul className="mt-3 space-y-2 text-sm text-slate-200/85">
                    {item.bullets.map((bullet) => (
                      <li
                        key={`${item.role}-${bullet.slice(0, 20)}-${index}`}
                        className="flex gap-2"
                      >
                        <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
