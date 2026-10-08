"use client";

import { useId, useState } from "react";
import { parseSkillPairs, type SkillCategory, type SkillIcon, type SkillsSectionContent } from "@/lib/skills";
import "./skills.css";

function SkillSymbol({ icon, className = "" }: { icon: SkillIcon | "search" | "check" | "bolt" | "arrow" | "shield"; className?: string }) {
  const paths = {
    cms: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h3m-3 4h3m4-4h1m-1 4h1M8 19h8" /></>,
    code: <><path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-12-2 14" /></>,
    server: <><rect x="3" y="3" width="18" height="7" rx="1.5" /><rect x="3" y="14" width="18" height="7" rx="1.5" /><path d="M7 6.5h.01M7 17.5h.01M13 6.5h4m-4 11h4" /></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0" /></>,
    terminal: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3m6 0h4" /></>,
    search: <><circle cx="10" cy="10" r="6" /><path d="m15 15 6 6" /></>,
    check: <><path d="m9 3 3-1 3 1 3 1 2 3 1 3-1 3-2 3-3 2-3 1-3-1-3-2-2-3-1-3 1-3 2-3z" /><path d="m8 11 3 3 5-5" /></>,
    bolt: <path d="m13 2-8 12h6l-1 8 9-13h-6z" />,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" /><path d="m8 12 3 3 5-6" /></>,
  };
  return <svg className={className} viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[icon]}</svg>;
}

export function SkillsExplorer({ content, categories, resumeUrl }: { content: SkillsSectionContent; categories: SkillCategory[]; resumeUrl: string }) {
  const id = useId();
  const [active, setActive] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const total = categories.reduce((count, category) => count + category.items.length, 0);
  const filtered = categories.filter((category) =>
    (active === "all" || active === category.id) &&
    (!term || category.title.toLowerCase().includes(term) || category.items.some((item) => item.name.toLowerCase().includes(term))),
  );
  const matched = filtered.reduce((count, category) => count + (
    !term || category.title.toLowerCase().includes(term)
      ? category.items.length : category.items.filter((item) => item.name.toLowerCase().includes(term)).length
  ), 0);
  const coreItems = parseSkillPairs(content.core_items);

  return (
    <section id="skills" className="skills skills-suite" aria-labelledby={`${id}-heading`}>
      <div className="skills-ambient" aria-hidden="true" />
      <div className="skills-meta">
        <div className="skills-eyebrow"><span className="skills-dot" />{content.eyebrow}{content.eyebrow_note && <><span className="skills-divider">{"//"}</span><span className="skills-eyebrow-note">{content.eyebrow_note}</span></>}</div>
        <div className="skills-verification">{content.verification && <span><SkillSymbol icon="check" />{content.verification}</span>}{content.updated_label && <span className="skills-updated">{content.updated_label}</span>}</div>
      </div>
      <div className="skills-intro">
        <div><h2 id={`${id}-heading`}>{content.heading} <em>{content.heading_accent}</em></h2><p>{content.description}</p></div>
        <div className="skills-readiness">
          <div className="skills-readiness-top"><span>{content.readiness_label}</span><span className="skills-status-pill">{content.readiness_status}</span></div>
          <div className="skills-total"><strong>{total}</strong><span>{content.count_caption}</span></div>
          <svg viewBox="0 0 200 32" className="skills-sparkline" fill="none" aria-hidden="true"><path d="M0 24 25 18 50 20 75 8 100 14 125 4 150 11 175 6 200 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M0 24 25 18 50 20 75 8 100 14 125 4 150 11 175 6 200 2V32H0Z" fill="currentColor" fillOpacity=".08" /></svg>
        </div>
      </div>
      <div className="skills-controls">
        <div className="skills-filters" role="group" aria-label="Filter skills by category">
          <button type="button" className="skills-filter" aria-pressed={active === "all"} onClick={() => setActive("all")}>All <span>{total}</span></button>
          {categories.map((category) => <button type="button" className="skills-filter" aria-pressed={active === category.id} key={category.id} onClick={() => setActive(category.id)}>{category.filterLabel} <span>{category.items.length}</span></button>)}
        </div>
        <div className="skills-search"><SkillSymbol icon="search" /><label className="sr-only" htmlFor={`${id}-search`}>Search technologies</label><input id={`${id}-search`} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={content.search_placeholder} /><span aria-live="polite">{matched}/{total}</span></div>
      </div>
      <div className="skills-matrix">
        {filtered.map((category) => {
          const titleMatches = category.title.toLowerCase().includes(term);
          return (
            <article key={category.id} aria-labelledby={id + "-category-" + category.id} className={`skills-card skills-accent-${category.accent} ${category.wide && active === "all" && !term ? "skills-card-wide" : ""}`}>
              <div className="skills-card-corner" aria-hidden="true" />
              <header className="skills-card-header"><div className="skills-icon"><SkillSymbol icon={category.icon} /></div><div className="skills-card-title"><h3 id={id + "-category-" + category.id}>{category.title}</h3><p>{category.eyebrow}</p></div><span className="skills-count">{category.items.length} <span>skills</span></span></header>
              <p className="skills-card-description">{category.description}</p>
              {category.meterScore > 0 && <div className="skills-meter"><div><span>{category.meterLabel}</span><span>{category.meterScore}%{category.meterNote && ` // ${category.meterNote}`}</span></div><div className="skills-meter-track"><span style={{ width: `${category.meterScore}%` }} /></div></div>}
              {category.highlights.length > 0 && <dl className="skills-highlights">{category.highlights.map((highlight, index) => <div key={`${highlight.label}-${index}`}><dt>{highlight.label}</dt><dd><strong><i className="skills-dot" />{highlight.value}</strong></dd></div>)}</dl>}
              <ul role="list" className="skills-tags">{category.items.map((item, index) => <li key={`${item.name}-${index}`} className={`${item.highlighted ? "skills-tag-highlight" : ""} ${term && !titleMatches && !item.name.toLowerCase().includes(term) ? "skills-tag-muted" : ""}`}>{item.name}</li>)}</ul>
              {(category.status || category.footerNote) && <footer className="skills-card-footer"><span>{category.status && <><i className="skills-dot" />{category.status}</>}</span><span>{category.footerNote}</span></footer>}
            </article>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="skills-empty" role="status"><p>No skills match your search.</p><button type="button" onClick={() => { setActive("all"); setQuery(""); }}>Clear filters</button></div>}
      {coreItems.length > 0 && <div id="core-stack" className="core-stack skills-core"><div className="skills-core-copy"><p className="skills-core-label"><SkillSymbol icon="bolt" />{content.core_eyebrow}{content.core_note && <span>{"// "}{content.core_note}</span>}</p><h3>{content.core_heading}</h3><p>{content.core_description}</p></div><ul role="list" className="skills-core-items">{coreItems.map((item, index) => <li key={`${item.label}-${index}`}><SkillSymbol icon={(["terminal", "cms", "code", "code"] as SkillIcon[])[index % 4]} /><strong>{item.label}</strong><span>{item.value}</span></li>)}</ul></div>}
      <div id="skills-cta" className="skills-cta"><div className="skills-icon skills-cta-icon"><SkillSymbol icon="shield" /></div><div className="skills-cta-copy"><h3>{content.cta_heading}</h3><p>{content.cta_description}</p></div><div className="skills-cta-actions">{resumeUrl && <a className="skills-button-primary" href={resumeUrl} target="_blank" rel="noopener noreferrer">{content.resume_label}<SkillSymbol icon="arrow" /></a>}{content.contact_url && <a className="skills-button-secondary" href={content.contact_url}>{content.contact_label}<SkillSymbol icon="arrow" /></a>}</div></div>
    </section>
  );
}
