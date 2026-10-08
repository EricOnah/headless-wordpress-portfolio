import { fetchPortfolioContent } from "@/lib/wordpress-content";
import { secureWordPressMediaUrl } from "@/lib/wordpress-media";
export const defaultHeroContent = {
  "label": "Headless WordPress Portfolio",
  "name": "Eric Onah",
  "role": "Full-stack Developer | WordPress | Headless CMS",
  "description": "WordPress specialist building performant, headless-ready experiences with React and Next.js.",
  "primary_label": "View projects",
  "primary_url": "/projects",
  "secondary_label": "Book a build",
  "secondary_url": "/contact",
  "image_alt": "WordPress and Next.js working together for headless builds",
  "caption_heading": "WordPress + Next.js builds",
  "caption_body": "Custom themes, REST APIs, performance tuning, security, and SEO.",
  "signals_heading": "Moving work signals",
  "signals_items": "Headless launch | Next.js + WordPress checkout tuned for spikes\nSEO uplift | Core Web Vitals green across mobile and desktop\nAPI hardening | Custom endpoints with caching + auth for partners\nEditor flow | Live preview + structured blocks for faster publishing\nPerformance | Edge caching and ISR for sub-second navigation\nSecurity | WAF rules, 2FA, and dependency audits each release",
  "image_url": "/placeholders/wp-next-hero.svg"
};
export type HeroContent = typeof defaultHeroContent;

function safeLink(value: string) {
  return /^\/(?!\/)/.test(value) || /^https?:\/\//i.test(value);
}

export function parseWorkSignals(value: string) {
  return value.split(/\r?\n/).map(line => {
    const separator = line.indexOf("|");
    return separator < 0
      ? { title: line.trim(), detail: "" }
      : { title: line.slice(0, separator).trim(), detail: line.slice(separator + 1).trim() };
  }).filter(item => item.title || item.detail);
}

export async function getHeroContent(): Promise<HeroContent> {
  const base = (process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "")
    .replace(/\/$/, "").replace(/\/wp-json$/, "");
  if (!base) return defaultHeroContent;
  try {
    const response = await fetchPortfolioContent(base + "/?rest_route=/wp/v2/homepage-heroes&status=publish&orderby=modified&order=desc&per_page=1");
    if (!response.ok) throw new Error("Hero content request failed: " + response.status);
    const entries: Array<{ hero_data?: Partial<HeroContent> }> = await response.json();
    const fields = entries[0]?.hero_data;
    if (!fields) return defaultHeroContent;
    const content = { ...defaultHeroContent };
    for (const key of Object.keys(content) as Array<keyof HeroContent>) {
      if (typeof fields[key] === "string") content[key] = fields[key];
    }
    for (const key of ["primary_url", "secondary_url"] as const) {
      if (!safeLink(content[key])) content[key] = "";
    }
    if (!safeLink(content.image_url)) content.image_url = defaultHeroContent.image_url;
    content.image_url = secureWordPressMediaUrl(content.image_url);
    return content;
  } catch (error) {
    console.error("Unable to load homepage hero content", error);
    return defaultHeroContent;
  }
}
