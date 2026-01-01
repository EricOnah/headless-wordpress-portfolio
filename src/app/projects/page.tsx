import Link from "next/link";
import { ProjectsGrid } from "@/components/projects-grid";
import { getProjects, hasWordPressSource } from "@/lib/wordpress";

export const revalidate = 300;

export default async function ProjectsPage() {
  const projects = await getProjects(20);
  const usingManual = !hasWordPressSource;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-black text-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              Projects
            </p>
            <h1 className="text-3xl font-semibold text-white">
              Headless, ecommerce, and experience builds
            </h1>
            <p className="text-sm text-slate-200/80">
              Curated case studies while WordPress syncing is paused{usingManual ? " - manually added for now." : "."}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/30 hover:bg-white/10"
          >
            <span aria-hidden>←</span>
            Back home
          </Link>
        </div>

        <ProjectsGrid projects={projects} />
      </div>
    </div>
  );
}
