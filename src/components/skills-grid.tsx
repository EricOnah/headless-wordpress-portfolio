 "use client";

import { useState } from "react";
import { skills } from "@/lib/content";

const categories = [
  { title: "WordPress & CMS", items: skills.wordpress },
  { title: "Front-end", items: skills.frontend },
  { title: "Back-end", items: skills.backend },
  { title: "Database", items: skills.database },
  { title: "Tools", items: skills.tools },
];

export function SkillsGrid() {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = (title: string) =>
    setOpenMap((prev) => ({ ...prev, [title]: !prev[title] }));

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
          Skills
        </p>
        <h2 className="text-2xl font-semibold text-white">
          Platforms, stacks, and workflows I ship with
        </h2>
      </div>
      <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.title}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.8)]"
          >
            <button
              type="button"
              onClick={() => toggle(category.title)}
              className="flex w-full items-center justify-between text-left text-sm font-semibold text-emerald-100 transition hover:text-emerald-200 cursor-pointer"
              aria-expanded={Boolean(openMap[category.title])}
            >
              <span>{category.title}</span>
              <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-100 ring-1 ring-white/10">
                {category.items.length}+
                <span className="text-[10px] text-emerald-200">
                  {openMap[category.title] ? "▾" : "▸"}
                </span>
              </span>
            </button>
            {openMap[category.title] ? (
              <div className="flex flex-wrap gap-2">
                {category.items.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-black/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100 ring-1 ring-white/10"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
