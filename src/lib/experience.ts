export const defaultExperienceContent = {
  eyebrow: "Experience // production impact",
  heading: "Full-stack and",
  heading_accent: "headless roles",
  description: "A documented history of building web applications, enterprise websites, e-commerce platforms, and headless CMS solutions through remote collaboration and measurable improvements.",
  metrics: "Experience | 8 | Years in full-stack development\nRemote work | 5+ | Years with distributed teams\nDelivery | 40+ | Websites & applications",
  all_label: "All roles", active_label: "Active roles", contract_label: "Contract", remote_label: "Remote & distributed",
  status_label: "Resume highlights",
  methodology_label: "Core methodology",
  methodology_heading: "Production standards & delivery principles",
  principles: "Full-stack & headless delivery | Build responsive interfaces, reliable APIs, and structured content layers using React, Node.js, PHP, and WordPress.\nVersion-controlled collaboration | Work independently with distributed teams through Git/GitHub, Azure DevOps, code reviews, progress updates, and clear handoffs.\nPerformance & automation | Improve page speed, streamline repetitive work with custom plugins, and support tested, production-ready delivery.",
  cta_label: "Explore the full professional profile",
  cta_heading: "Need the full experience and project details?",
  cta_description: "View the resume for selected projects, technical skills, and remote work strengths, or get in touch to discuss your next build.",
  resume_label: "View full resume / CV", contact_label: "Discuss an opportunity", contact_url: "/contact",
};
export type ExperienceContent = typeof defaultExperienceContent;
export type ExperienceFields = {
  company: string; period: string; location: string; engagement: string; status: string;
  active: string; contract: string; remote: string; summary: string; achievements: string; tags: string; accent: string;
  highlight_label: string; highlight_value: string; highlight_description: string;
  progress_label: string; progress_value: string; progress_percent: string; footer_label: string; footer_value: string;
};
export type ExperienceRole = { id: number; title: string; fields: ExperienceFields };
export const defaultExperienceRoles: ExperienceRole[] = [
  { id: 1, title: "Full-Stack Developer (Contract)", fields: {
    company: "Kristech", period: "2021 – Present", location: "Remote", engagement: "Contract / remote client projects", status: "Active contract", active: "1", contract: "1", remote: "1", accent: "emerald",
    summary: "Deliver custom WordPress websites, WooCommerce stores, and headless CMS solutions for multiple client projects while managing priorities, deadlines, and client-driven changes remotely.",
    achievements: "Built reusable React components integrated with WordPress REST APIs and collaborated through version-controlled development, review, testing, and deployment workflows.\nReduced average website loading times by 55% and increased WooCommerce conversion rates by up to 30%.\nDelivered more than 40 successful websites and web applications while managing priorities, deadlines, troubleshooting, and client-driven changes in a remote environment.\nDiagnosed production issues and implemented performance and usability improvements that reduced support requests.",
    tags: "*Headless WordPress\nWooCommerce\nReact\nREST APIs\nGit",
    highlight_label: "Performance & conversion", highlight_value: "55% faster loading",
    highlight_description: "Reduced average website loading times by 55% and increased WooCommerce conversion rates by up to 30%.",
    progress_label: "Average load-time reduction", progress_value: "55%", progress_percent: "55", footer_label: "Delivered projects", footer_value: "40+ websites & apps",
  } },
  { id: 2, title: "Full-Stack Developer", fields: {
    company: "Techlink", period: "2025 – 2026", location: "Remote", engagement: "Full-stack web applications", status: "2025 – 2026", active: "0", contract: "0", remote: "1", accent: "cyan",
    summary: "Architect and develop scalable web applications using React, Node.js, Express.js, MongoDB, PHP, and WordPress while independently managing development work and delivery deadlines.",
    achievements: "Designed RESTful APIs and optimized frontend performance, reducing page-load times by more than 40%.\nDeveloped custom WordPress plugins and automation tools that reduced manual workload by 60%.\nImproved Lighthouse performance scores from below 70 to above 95 and supported code delivery through Git and Azure DevOps workflows.",
    tags: "*React\nNode.js\nExpress.js\nMongoDB\nPHP\nWordPress\nRESTful APIs\nAzure DevOps",
    highlight_label: "Performance & automation", highlight_value: ">40% faster page loads",
    highlight_description: "Frontend optimization reduced page-load times by more than 40%. Custom plugins and automation reduced manual workload by 60%.",
    progress_label: "Lighthouse performance", progress_value: ">95 (from <70)", progress_percent: "95", footer_label: "Manual workload", footer_value: "Reduced by 60%",
  } },
  { id: 3, title: "Web Developer", fields: {
    company: "Tracetech", period: "2018 – 2021", location: "", engagement: "Websites & business applications", status: "Completed role", active: "0", contract: "0", remote: "0", accent: "emerald",
    summary: "Developed responsive websites and business applications using PHP, JavaScript, MySQL, HTML5, and CSS3.",
    achievements: "Integrated APIs, payment gateways, and customer-management systems while improving uptime, reliability, and maintainability.",
    tags: "*PHP\nJavaScript\nMySQL\nHTML5\nCSS3\nAPI integrations",
    highlight_label: "Connected business systems", highlight_value: "APIs & payment integrations",
    highlight_description: "Connected payment gateways and customer-management systems with an emphasis on uptime, reliability, and maintainability.",
    progress_label: "", progress_value: "", progress_percent: "0", footer_label: "Focus", footer_value: "Reliable web applications",
  } },
];
export function experienceLines(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}
export function experiencePairs(value: string) {
  return experienceLines(value).map((line) => { const [label = "", value = "", ...rest] = line.split("|").map((part) => part.trim()); return { label, value, detail: rest.join(" | ") }; });
}

type WpExperience = { id: number; experience_data: Record<string, string> };
async function fetchExperience(base: string, path: string): Promise<WpExperience[]> {
  const response = await fetch(`${base}/?rest_route=/wp/v2/${path}`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`Experience request failed: ${response.status}`);
  return response.json();
}
export async function getExperienceData(): Promise<{ content: ExperienceContent; roles: ExperienceRole[] }> {
  const base = (process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL)?.replace(/\/$/, "").replace(/\/wp-json$/, "");
  if (!base) return { content: defaultExperienceContent, roles: defaultExperienceRoles };
  const [section, entries] = await Promise.allSettled([
    fetchExperience(base, "experience-sections&status=publish&orderby=modified&order=desc&per_page=1"),
    fetchExperience(base, "experience-roles&status=publish&orderby=menu_order&order=asc&per_page=100"),
  ]);
  let content = defaultExperienceContent;
  if (section.status === "fulfilled" && section.value[0]?.experience_data) {
    const fields = section.value[0].experience_data;
    content = Object.fromEntries(Object.entries(defaultExperienceContent).map(([key, fallback]) => [key, typeof fields[key] === "string" ? fields[key] : fallback])) as ExperienceContent;
  } else if (section.status === "rejected") console.error("Unable to load experience section", section.reason);
  let roles = defaultExperienceRoles;
  if (entries.status === "fulfilled") {
    roles = entries.value.map((entry) => ({ id: entry.id, title: entry.experience_data.title || "Experience", fields: Object.fromEntries(Object.keys(defaultExperienceRoles[0].fields).map((key) => [key, typeof entry.experience_data[key] === "string" ? entry.experience_data[key] : ""])) as ExperienceFields }));
  } else console.error("Unable to load experience roles", entries.reason);
  return { content, roles };
}
