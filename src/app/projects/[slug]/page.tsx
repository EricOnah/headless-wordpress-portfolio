
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortfolioProjectsData } from "@/lib/portfolio-projects";
export default async function ProjectDetailPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const {projects}=await getPortfolioProjectsData();
 const p=projects.find(project=>project.slug===slug);
 if(!p) notFound();
 return <main id="main-content" tabIndex={-1} className="project-detail-page mx-auto max-w-4xl space-y-6 px-6 py-12">
  <article id="project-detail" aria-labelledby="project-heading" className="project-detail space-y-6">
  <Link href="/projects" className="text-emerald-200">← All projects</Link><p className="text-sm text-emerald-200">{p.category}</p>
  <h1 id="project-heading" className="text-4xl font-semibold">{p.title}</h1><p className="text-lg leading-relaxed text-slate-200">{p.description}</p><p className="text-sm text-slate-400">{p.highlight}</p>
  <ul role="list" className="flex flex-wrap gap-2">{p.tags.map(t=><li key={t} className="rounded-full bg-white/10 px-3 py-1 text-xs">{t}</li>)}</ul>
  {p.url&&<a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full bg-emerald-500 px-5 py-3 text-slate-950">View website ↗</a>}
 </article></main>;
}
