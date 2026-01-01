/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { Project } from "@/lib/wordpress";
import { ProjectCard } from "./project-card";

type ProjectsGridProps = {
  projects: Project[];
  hrefBase?: string;
};

export function ProjectsGrid({ projects, hrefBase = "/projects" }: ProjectsGridProps) {
  const tags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((project) => project.tags.forEach((tag) => tag && set.add(tag)));
    return ["All", ...Array.from(set)];
  }, [projects]);

  const [activeTag, setActiveTag] = useState<string>("All");

  const filtered = activeTag === "All" ? projects : projects.filter((project) => project.tags.includes(activeTag));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              activeTag === tag
                ? "border-emerald-300/40 bg-emerald-500/15 text-emerald-100 shadow-[0_10px_30px_-15px_rgba(16,185,129,0.7)]"
                : "border-white/15 bg-white/5 text-slate-100 hover:border-white/30 hover:bg-white/10"
            }`}
            type="button"
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} hrefBase={hrefBase} />
        ))}
      </div>
    </div>
  );
}
