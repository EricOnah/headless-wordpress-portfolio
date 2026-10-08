import { fetchPortfolioContent } from "@/lib/wordpress-content";
import { skills } from "./content";

export type SkillIcon = "cms" | "code" | "server" | "database" | "terminal";
export type SkillCategory = {
  id: number;
  title: string;
  filterLabel: string;
  eyebrow: string;
  description: string;
  items: Array<{ name: string; highlighted: boolean }>;
  icon: SkillIcon;
  accent: "emerald" | "cyan";
  wide: boolean;
  meterLabel: string;
  meterScore: number;
  meterNote: string;
  highlights: Array<{ label: string; value: string }>;
  status: string;
  footerNote: string;
};

export const defaultSkillsSection = {
  eyebrow: "Skills & expertise",
  eyebrow_note: "Engineering toolkit",
  heading: "Platforms, stacks, & workflows",
  heading_accent: "I ship with.",
  description: "Practical expertise across WordPress, modern web applications, and reliable development workflows. Built around performance, maintainability, and great publishing experiences.",
  verification: "Built for production",
  updated_label: "Always evolving",
  readiness_label: "System readiness",
  readiness_status: "Active suite",
  count_caption: "Technologies in Core Radar",
  search_placeholder: "Filter stack (e.g. Next.js, PHP)...",
  core_eyebrow: "Current core stack",
  core_note: "Daily driver",
  core_heading: "The headless development engine",
  core_description: "Fast, search-engine-ready web experiences with structured content and reusable interfaces.",
  core_items: "Next.js | App Router\nWordPress | Headless CMS\nTypeScript | Typed interfaces\nTailwind CSS | Design system",
  cta_heading: "Ready to talk about your next build?",
  cta_description: "Available for WordPress projects, headless CMS integrations, and full-stack development.",
  resume_label: "View technical resume",
  contact_label: "Discuss a project",
  contact_url: "/contact",
};
export type SkillsSectionContent = typeof defaultSkillsSection;

export const defaultSkillCategories: SkillCategory[] = [
  { id: 1, title: "WordPress & CMS", filterLabel: "CMS", eyebrow: "Content architecture & publishing", description: "Custom themes, plugins, and headless content layers that keep publishing flexible and websites fast.", items: skills.wordpress.map((name) => ({ name, highlighted: name.includes("Headless") })), icon: "cms", accent: "emerald", wide: false, meterLabel: "", meterScore: 0, meterNote: "", highlights: [], status: "CMS & commerce", footerNote: "Custom builds" },
  { id: 2, title: "Front-end Engineering", filterLabel: "Frontend", eyebrow: "Modern interfaces & web experiences", description: "Responsive interfaces, reusable components, and modern applications built around performance and accessibility.", items: skills.frontend.map((name) => ({ name, highlighted: ["Next.js", "React.js", "Tailwind CSS"].includes(name) })), icon: "code", accent: "cyan", wide: false, meterLabel: "", meterScore: 0, meterNote: "", highlights: [], status: "Responsive by design", footerNote: "Component-driven" },
  { id: 3, title: "Back-end Systems", filterLabel: "Backend", eyebrow: "Application logic & integrations", description: "Server-side functionality, API integrations, and reliable business logic for content-rich web applications.", items: skills.backend.map((name) => ({ name, highlighted: name === "PHP" })), icon: "server", accent: "emerald", wide: false, meterLabel: "", meterScore: 0, meterNote: "", highlights: [], status: "API-ready", footerNote: "Reliable foundations" },
  { id: 4, title: "Database & Data", filterLabel: "Database", eyebrow: "Structured storage & data layers", description: "Data modeling, database-backed applications, and maintainable storage for websites and services.", items: skills.database.map((name) => ({ name, highlighted: name === "MySQL" })), icon: "database", accent: "cyan", wide: false, meterLabel: "", meterScore: 0, meterNote: "", highlights: [], status: "Structured data", footerNote: "Connected systems" },
  { id: 5, title: "Tools, DevOps & Workflow", filterLabel: "Tools & DevOps", eyebrow: "Version control & delivery", description: "Repeatable development workflows, performance diagnostics, and dependable local-to-production delivery.", items: skills.tools.map((name) => ({ name, highlighted: name === "Git" })), icon: "terminal", accent: "emerald", wide: true, meterLabel: "", meterScore: 0, meterNote: "", highlights: [{ label: "Version control", value: "Git & GitHub" }, { label: "Optimization", value: "Performance tools" }, { label: "Delivery", value: "Deployment workflows" }], status: "Delivery focused", footerNote: "From local to production" },
];

export function parseSkillLines(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}
export function parseSkillPairs(value: string) {
  return parseSkillLines(value).map((line) => {
    const [label, ...details] = line.split("|");
    return { label: label.trim(), value: details.join("|").trim() };
  });
}

type WpSkillsEntry = { id: number; skills_data: Record<string, string> };

async function fetchSkillsEntries(base: string, path: string): Promise<WpSkillsEntry[]> {
  const response = await fetchPortfolioContent(`${base}/?rest_route=/wp/v2/${path}`);
  if (!response.ok) throw new Error(`Skills request failed: ${response.status}`);
  return response.json();
}

export async function getSkillsData(): Promise<{ content: SkillsSectionContent; categories: SkillCategory[] }> {
  const base = (process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL)
    ?.replace(/\/$/, "").replace(/\/wp-json$/, "");
  if (!base) return { content: defaultSkillsSection, categories: defaultSkillCategories };

  const [sectionResult, categoryResult] = await Promise.allSettled([
    fetchSkillsEntries(base, "skills-sections&status=publish&orderby=modified&order=desc&per_page=1"),
    fetchSkillsEntries(base, "skill-categories&status=publish&orderby=menu_order&order=asc&per_page=100"),
  ]);
  let content = defaultSkillsSection;
  if (sectionResult.status === "fulfilled" && sectionResult.value[0]?.skills_data) {
    const fields = sectionResult.value[0].skills_data;
    content = Object.fromEntries(Object.entries(defaultSkillsSection).map(([key, fallback]) => [key, typeof fields[key] === "string" ? fields[key] : fallback])) as SkillsSectionContent;
  } else if (sectionResult.status === "rejected") {
    console.error("Unable to load skills section", sectionResult.reason);
  }
  let categories = defaultSkillCategories;
  if (categoryResult.status === "fulfilled") {
    categories = categoryResult.value.map(({ id, skills_data: fields }) => ({
      id, title: fields.title || "Skills", filterLabel: fields.filter_label || fields.title || "Skills",
      eyebrow: fields.eyebrow || "", description: fields.description || "",
      items: parseSkillLines(fields.items || "").map((item) => ({ name: item.replace(/^\*\s*/, ""), highlighted: item.startsWith("*") })),
      icon: (["cms", "code", "server", "database", "terminal"].includes(fields.icon) ? fields.icon : "code") as SkillIcon,
      accent: fields.accent === "cyan" ? "cyan" : "emerald",
      wide: fields.wide === "1", meterLabel: fields.meter_label || "",
      meterScore: Math.min(100, Math.max(0, Number(fields.meter_score) || 0)), meterNote: fields.meter_note || "",
      highlights: parseSkillPairs(fields.highlights || ""), status: fields.status || "", footerNote: fields.footer_note || "",
    }));
  } else {
    console.error("Unable to load skill categories", categoryResult.reason);
  }
  return { content, categories };
}
