/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Project } from "@/lib/wordpress";

type ProjectCardProps = {
  project: Project;
  featured?: boolean;
  hrefBase?: string;
};

function formatDate(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function ProjectCard({
  project,
  featured = false,
  hrefBase = "/projects",
}: ProjectCardProps) {
  const image =
    project.featuredImage ??
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4";

  return (
    <Link
      href={`${hrefBase}/${project.slug}`}
      className="group relative block h-full transition-transform duration-300 hover:-translate-y-1"
    >
      <article
        className={`project-card relative h-full overflow-hidden rounded-3xl border border-white/15 bg-white/10 backdrop-blur shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)] ${featured ? "p-6 lg:p-8" : "p-5"}`}
      >
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-emerald-400 via-cyan-300 to-indigo-400" />

        <div className="grid h-full gap-6 lg:grid-cols-5 lg:items-stretch">
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200">
              <span className="rounded-full bg-emerald-900/40 px-3 py-1 ring-1 ring-emerald-300/20">
                Headless
              </span>
              <time dateTime={project.date} className="text-slate-200/80">{formatDate(project.date)}</time>
            </div>

            <h3 className="text-2xl font-semibold leading-tight text-white transition-colors duration-200 group-hover:text-emerald-200">
              {project.title}
            </h3>

            <p className="text-sm leading-relaxed text-slate-200/90 lg:max-w-2xl">
              {project.excerpt}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.tags.slice(0, 4).map((tag) => (
                <span
                  key={`${project.slug}-${tag}`}
                  className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100 ring-1 ring-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 flex">
            <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-slate-900/60 ring-1 ring-white/10 lg:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/20 via-cyan-200/10 to-indigo-300/20" />
              <img
                src={image}
                alt={project.featuredImageAlt ?? project.title}
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-300 ease-out group-hover:scale-[1.02] group-hover:opacity-100"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-emerald-500/15" />
              <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white ring-1 ring-white/15">
                View
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
