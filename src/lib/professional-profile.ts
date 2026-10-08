import { secureWordPressMediaUrl } from "@/lib/wordpress-media";
import { person, summary } from "@/lib/content";

export type ProfessionalProfile = {
  summary_heading: string;
  summary_body: string;
  summary_body2: string;
  availability: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  resume_url: string;
};

const fallback: ProfessionalProfile = {
  summary_heading: "Professional Summary",
  summary_body: summary.body,
  summary_body2: summary.body2,
  availability: "Available",
  email: person.email,
  phone: person.phone,
  linkedin: person.linkedin,
  github: person.github,
  resume_url: "",
};

export async function getProfessionalProfile(): Promise<ProfessionalProfile> {
  const base = (
    process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL
  )?.replace(/\/$/, "").replace(/\/wp-json$/, "");
  if (!base) return fallback;

  try {
    const response = await fetch(
      `${base}/?rest_route=/wp/v2/professional-profiles&status=publish&orderby=modified&order=desc&per_page=1`,
      { cache: "no-store", signal: AbortSignal.timeout(5000) },
    );
    if (!response.ok) throw new Error(`Professional profile request failed: ${response.status}`);
    const entries: Array<{ profile?: Partial<ProfessionalProfile> }> = await response.json();
    const profile = entries[0]?.profile;
    if (!profile) return fallback;
    const content = Object.fromEntries(
      Object.entries(fallback).map(([key, value]) => [
        key,
        typeof profile[key as keyof ProfessionalProfile] === "string"
          ? profile[key as keyof ProfessionalProfile]
          : value,
      ]),
    ) as ProfessionalProfile;
    content.resume_url = secureWordPressMediaUrl(content.resume_url);
    return content;
  } catch (error) {
    console.error("Unable to load WordPress professional profile", error);
    return fallback;
  }
}
