
/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useId, useState } from "react";
import type { PortfolioProject, ProjectsSectionContent } from "@/lib/portfolio-projects";
export function PortfolioProjectsExplorer({projects,section:s,featuredOnly,resumeUrl}:{projects:PortfolioProject[];section:ProjectsSectionContent;featuredOnly:boolean;resumeUrl:string}) {
 const id=useId();
 const [filter,setFilter]=useState("");
 const categories=[...new Set(projects.map(p=>p.category))];
 const shown=filter?projects.filter(p=>p.category===filter):projects;
 const Heading=featuredOnly?"h2":"h1";
 const CardHeading=featuredOnly?"h3":"h2";
 return <section id={featuredOnly ? "featured-project" : "projects"} className={(featuredOnly ? "featured-project" : "projects") + " portfolio-suite"} aria-labelledby={id + "-heading"}>
  <div className="portfolio-topline"><p className="portfolio-eyebrow"><i/>{s.eyebrow}</p><span>{projects.length} {featuredOnly?"featured projects":"projects in archive"}</span></div>
  <div className="portfolio-intro"><div><Heading id={id + "-heading"}>{s.heading} <span>{s.heading_accent}</span></Heading><p>{s.description}</p></div>
   <dl className="portfolio-metrics"><div><dt>Projects</dt><dd><strong>{String(projects.length).padStart(2,"0")}</strong></dd></div><div><dt>Categories</dt><dd><strong>{String(categories.length).padStart(2,"0")}</strong></dd></div><div><dt>Approach</dt><dd><strong>CMS</strong></dd></div></dl>
  </div>
  <div className="portfolio-toolbar"><div className="portfolio-filters" role="group" aria-label="Filter projects">
   <button type="button" onClick={()=>setFilter("")} aria-pressed={!filter}>{s.all_label} ({projects.length})</button>
   {categories.map(c=><button type="button" key={c} aria-pressed={filter===c} onClick={()=>setFilter(c)}>{c} ({projects.filter(p=>p.category===c).length})</button>)}
  </div>{featuredOnly&&<Link href="/projects" className="portfolio-archive">{s.archive_label} ↗</Link>}</div>
  <p className="portfolio-count" aria-live="polite">{shown.length} {shown.length===1?"project":"projects"}</p>
  <div className="portfolio-grid">{shown.map(p=><article key={p.id} aria-labelledby={id + "-project-" + p.id} className={"portfolio-card portfolio-"+p.accent}>
   <div className="portfolio-copy"><span className="portfolio-badge">{p.badge||p.category}</span><CardHeading id={id + "-project-" + p.id}>{p.title}</CardHeading><p>{p.description}</p>
    {p.highlight&&<div className="portfolio-highlight"><span aria-hidden>⌁</span>{p.highlight}</div>}
    <ul role="list" className="portfolio-tags">{p.tags.map(t=><li key={t}>{t}</li>)}</ul>
   </div>
   <div className="portfolio-visual">
    {p.image_url?<img src={p.image_url} alt={p.image_alt} loading="lazy"/>:<div className="portfolio-placeholder" aria-hidden="true"><div className="portfolio-window"><span>● ● ●</span><strong>{p.title}</strong><i/><i/><i/><b>{p.category}</b></div></div>}
    {p.url&&<a href={p.url} target="_blank" rel="noopener noreferrer" className="portfolio-view" aria-label={s.view_label+" "+p.title+" website (opens in a new tab)"}>{s.view_label} ↗</a>}
   </div>
  </article>)}</div>
  {!shown.length&&<p className="portfolio-empty">No projects published yet.</p>}
  {(s.principles||s.principles_heading)&&<div id="project-principles" className="project-principles portfolio-principles"><p className="portfolio-label">{s.principles_label}</p><h2>{s.principles_heading}</h2><div>{s.principles.split(/\r?\n/).filter(Boolean).map((line,i)=>{const [title,...body]=line.split("|");return <article className="project-principle" key={line}><span aria-hidden>{["↗","▤","◇"][i%3]}</span><h3>{title.trim()}</h3><p>{body.join("|").trim()}</p></article>;})}</div></div>}
  <div id="projects-cta" className="projects-cta portfolio-cta"><div><p className="portfolio-label">● {s.cta_label}</p><h2>{s.cta_heading}</h2><p>{s.cta_description}</p></div><div className="portfolio-actions">{s.contact_url&&<Link href={s.contact_url}>{s.contact_label} ↗</Link>}{resumeUrl&&<a href={resumeUrl} target="_blank" rel="noopener noreferrer">{s.resume_label} ↗</a>}</div></div>
 </section>;
}
