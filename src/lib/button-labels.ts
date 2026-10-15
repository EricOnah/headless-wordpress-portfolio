import { cache } from "react";
import defaults from "../../cms/mu-plugins/portfolio-button-labels.json";
import { fetchPortfolioContent } from "@/lib/wordpress-content";

export const defaultButtonLabels = defaults;
export type ButtonSection = keyof typeof defaults;
export type ButtonLabels<S extends ButtonSection> = (typeof defaults)[S];
const routes: Record<ButtonSection, string> = {
  header: "header-contents", profile: "professional-profiles", skills: "skills-sections",
  experience: "experience-sections", projects: "project-sections", posts: "posts-sections",
  contact: "contact-pages", footer: "footer-contents",
};

// Share each section request within a render, while reading fresh CMS data on refresh.
const loadLabels = cache(async (section: ButtonSection): Promise<Record<string, string>> => {
  const fallback = { ...defaults[section] };
  const base = (process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "")
    .replace(/\/$/, "").replace(/\/wp-json$/, "");
  if (!base) return fallback;
  try {
    const response = await fetchPortfolioContent(`${base}/?rest_route=/wp/v2/${routes[section]}&status=publish&orderby=modified&order=desc&per_page=1`);
    if (!response.ok) throw new Error(`Button labels request failed: ${response.status}`);
    const entries: Array<{ button_labels?: Record<string, unknown> }> = await response.json();
    const saved = entries[0]?.button_labels;
    return Object.fromEntries(Object.entries(fallback).map(([key, value]) => [key,
      typeof saved?.[key] === "string" && saved[key].trim() ? saved[key] : value,
    ]));
  } catch (error) {
    console.error(`Unable to load ${section} button labels`, error);
    return fallback;
  }
});

export async function getButtonLabels<S extends ButtonSection>(section: S): Promise<ButtonLabels<S>> {
  return await loadLabels(section) as ButtonLabels<S>;
}
