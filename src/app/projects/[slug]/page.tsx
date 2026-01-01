/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { Project, getProjectBySlug, getProjects } from "@/lib/wordpress";

export const revalidate = 300;

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type PageParams = { slug: string } | Promise<{ slug: string }>;

async function resolveParams(params: PageParams) {
  return await Promise.resolve(params);
}

export default async function ProjectDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const { slug } = await resolveParams(params);
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-black text-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Case study</p>
            <h1 className="text-3xl font-semibold text-white">{project.title}</h1>
            <p className="text-sm text-slate-200/80">Published {formatDate(project.date)}</p>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/30 hover:bg-white/10"
          >
            <span aria-hidden>←</span>
            Back
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.9)] backdrop-blur">
          {project.featuredImage ? (
            <div className="relative h-72 w-full overflow-hidden">
              <img
                src={project.featuredImage}
                alt={project.featuredImageAlt ?? project.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            </div>
          ) : null}

          <div className="space-y-6 p-8">
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={`${project.slug}-${tag}`}
                  className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100 ring-1 ring-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-lg leading-relaxed text-slate-100">
              {project.excerpt}
            </p>
            <div
              className="rich-text rounded-2xl bg-white p-6 text-base shadow-inner shadow-slate-200/60"
              dangerouslySetInnerHTML={{ __html: project.content ?? "" }}
            />
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
              <span className="rounded-full bg-emerald-500/15 px-3 py-2 ring-1 ring-emerald-200/40">REST API</span>
              <span className="rounded-full bg-emerald-500/15 px-3 py-2 ring-1 ring-emerald-200/40">Next.js ISR</span>
              <span className="rounded-full bg-emerald-500/15 px-3 py-2 ring-1 ring-emerald-200/40">Reusable blocks</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-100 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.9)]">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
            Next build
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            Need a similar WordPress or headless project?
          </p>
          <p className="mt-2 text-slate-200/85">
            I deliver custom themes, plugins, REST APIs, and Next.js front-ends with performance, security, and SEO in mind.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-white-dark">
              Start a project
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/40 hover:bg-white/10"
            >
              View more work
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const projects = await getProjects(6);
  return projects.map((project: Project) => ({ slug: project.slug }));
}
