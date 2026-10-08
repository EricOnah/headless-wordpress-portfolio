"use client";

import { useId, useState } from "react";
import { experienceLines, experiencePairs, type ExperienceContent, type ExperienceRole } from "@/lib/experience";
import "./experience.css";

function ExperienceIcon({ icon }: { icon: "check" | "building" | "globe" | "arrow" | "network" | "shield" | "rocket" }) {
  const paths = {
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
    building: <><path d="M4 21V5h10v16M14 9h6v12M2 21h20M7 8h4M7 12h4M7 16h4m10-4h1m-1 4h1" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    network: <><rect x="8" y="3" width="8" height="6" rx="1" /><rect x="2" y="16" width="7" height="5" rx="1" /><rect x="15" y="16" width="7" height="5" rx="1" /><path d="M12 9v4H5v3m7-3h7v3" /></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" /><path d="m8 12 3 3 5-6" /></>,
    rocket: <><path d="M14 4c3-2 7-1 7-1s1 4-1 7l-8 8-6-6zM9 9H4l-2 6 5-1m8 1v5l-6 2 1-5M5 19l-2 2" /><circle cx="16" cy="8" r="2" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[icon]}</svg>;
}

type RoleFilter = "all" | "active" | "contract" | "remote";
export function ExperienceExplorer({ content, roles, resumeUrl }: { content: ExperienceContent; roles: ExperienceRole[]; resumeUrl: string }) {
  const id = useId();
  const [filter, setFilter] = useState<RoleFilter>("all");
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const filtered = roles.filter((role) => filter === "all" || role.fields[filter] === "1");
  const filters: Array<{ key: RoleFilter; label: string; count: number }> = [
    { key: "all", label: content.all_label, count: roles.length },
    { key: "active", label: content.active_label, count: roles.filter((role) => role.fields.active === "1").length },
    { key: "contract", label: content.contract_label, count: roles.filter((role) => role.fields.contract === "1").length },
    { key: "remote", label: content.remote_label, count: roles.filter((role) => role.fields.remote === "1").length },
  ];
  const metrics = experiencePairs(content.metrics);
  const principles = experiencePairs(content.principles);
  return (
    <section id="experience" className="experience experience-suite" aria-labelledby={`${id}-heading`}>
      <div className="experience-ambient" aria-hidden="true" />
      <div className="experience-intro">
        <div className="experience-intro-copy"><p className="experience-eyebrow"><i />{content.eyebrow}</p><h2 id={`${id}-heading`}>{content.heading} <span>{content.heading_accent}</span></h2><p className="experience-description">{content.description}</p></div>
        {metrics.length > 0 && <dl className="experience-metrics">{metrics.map((metric, index) => <div key={`${metric.label}-${index}`}><dt>{metric.label}</dt><dd><strong>{metric.value}</strong><p>{metric.detail}</p></dd></div>)}</dl>}
      </div>
      <div className="experience-toolbar"><div className="experience-filters" role="group" aria-label="Filter experience roles">{filters.map((item) => <button key={item.key} type="button" aria-pressed={filter === item.key} onClick={() => setFilter(item.key)}>{item.label} <span>({item.count})</span></button>)}</div>{content.status_label && <span className="experience-toolbar-status"><i />{content.status_label}</span>}</div>
      <div className="experience-roles">
        {filtered.map((role) => {
          const fields = role.fields;
          const isOpen = !collapsed[role.id];
          const percent = Math.min(100, Math.max(0, Number(fields.progress_percent) || 0));
          const hasResult = fields.highlight_label || fields.highlight_value || fields.highlight_description || fields.footer_value || percent > 0;
          return (
            <article className={`experience-role ${fields.accent === "cyan" ? "experience-cyan" : ""}`} key={role.id} aria-labelledby={`${id}-role-${role.id}`}>
              <header className="experience-role-header"><div className="experience-role-title"><div><h3 id={`${id}-role-${role.id}`}>{role.title}</h3>{fields.status && <span className={`experience-status ${fields.active === "1" ? "experience-status-active" : ""}`}><i />{fields.status}</span>}</div><div className="experience-company-row"><span className="experience-company"><ExperienceIcon icon="building" />{fields.company}</span>{fields.engagement && <span className="experience-engagement">{fields.engagement}</span>}{fields.location && <span className="experience-location"><ExperienceIcon icon="globe" />{fields.location}</span>}</div></div><button type="button" className="experience-period" onClick={() => setCollapsed((previous) => ({ ...previous, [role.id]: !previous[role.id] }))} aria-expanded={isOpen} aria-controls={`${id}-details-${role.id}`} aria-label={`${isOpen ? "Hide" : "Show"} details for ${role.title} at ${fields.company}`}><span>{fields.period}</span><span className="experience-chevron">{isOpen ? "⌄" : "›"}</span></button></header>
              <div id={`${id}-details-${role.id}`} hidden={!isOpen}>
                <div className={`experience-role-content ${hasResult ? "experience-with-result" : ""}`}><div className="experience-narrative">{fields.summary && <p>{fields.summary}</p>}<ul role="list">{experienceLines(fields.achievements).map((achievement, index) => <li key={`${role.id}-${index}`}><ExperienceIcon icon="check" /><span>{achievement}</span></li>)}</ul><ul role="list" className="experience-tags">{experienceLines(fields.tags).map((tag, index) => <li key={`${tag}-${index}`} className={tag.startsWith("*") ? "experience-tag-accent" : ""}>{tag.replace(/^\*\s*/, "")}</li>)}</ul></div>{hasResult && <aside className="experience-result" aria-label={`${fields.company} results`}><div><p className="experience-result-label">{fields.highlight_label}</p><strong>{fields.highlight_value}</strong><p>{fields.highlight_description}</p></div>{(percent > 0 || fields.footer_label || fields.footer_value) && <div className="experience-result-footer">{percent > 0 && <><div className="experience-result-row"><span>{fields.progress_label}</span><span>{fields.progress_value || `${percent}%`}</span></div><div className="experience-progress"><span style={{ width: `${percent}%` }} /></div></>}<div className="experience-result-row"><span>{fields.footer_label}</span><span>{fields.footer_value}</span></div></div>}</aside>}</div>
              </div>
            </article>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="experience-empty" role="status"><p>No published roles in this category.</p><button type="button" onClick={() => setFilter("all")}>Show all roles</button></div>}
      {principles.length > 0 && <div id="experience-methodology" className="experience-methodology"><p className="experience-label">{content.methodology_label}</p><h3>{content.methodology_heading}</h3><div className="experience-principles">{principles.map((principle, index) => <article className="experience-principle" key={`${principle.label}-${index}`}><div className="experience-principle-icon"><ExperienceIcon icon={(["network", "shield", "rocket"] as const)[index % 3]} /></div><h4>{principle.label}</h4><p>{principle.value}{principle.detail && ` | ${principle.detail}`}</p></article>)}</div></div>}
      <div id="experience-cta" className="experience-cta"><div><p className="experience-label">{content.cta_label}</p><h3>{content.cta_heading}</h3><p>{content.cta_description}</p></div><div className="experience-actions">{resumeUrl && <a className="experience-button-primary" href={resumeUrl} target="_blank" rel="noopener noreferrer">{content.resume_label}<ExperienceIcon icon="arrow" /></a>}{content.contact_url && <a className="experience-button-secondary" href={content.contact_url}>{content.contact_label}<ExperienceIcon icon="arrow" /></a>}</div></div>
    </section>
  );
}
