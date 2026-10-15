import { fetchPortfolioContent } from "@/lib/wordpress-content";
import { secureWordPressMediaUrl } from "@/lib/wordpress-media";
import { person, summary } from "@/lib/content";

export type ProfessionalProfile = {
  summary_heading: string;
  summary_body: string;
  summary_body2: string;
  about_label: string;
  about_heading: string;
  about_body: string;
  about_body2: string;
  about_contact_heading: string;
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
  about_label: "About Eric Onah",
  about_heading: "Full-stack Developer | WordPress | Headless CMS",
  about_body: summary.body,
  about_body2: summary.body2,
  about_contact_heading: "Contact",
  availability: "Available",
  email: person.email,
  phone: person.phone,
  linkedin: person.linkedin,
  github: person.github,
  resume_url: "/Eric_Onah_Resume_full-stack.pdf",
};

export async function getProfessionalProfile(): Promise<ProfessionalProfile> {
  const base = (
    process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL
  )?.replace(/\/$/, "").replace(/\/wp-json$/, "");
  if (!base) return fallback;

  try {
    const response = await fetchPortfolioContent(
      `${base}/?rest_route=/wp/v2/professional-profiles&status=publish&orderby=modified&order=desc&per_page=1`,
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
    // Older CMS versions keep their current About introduction until its own fields exist.
    if (typeof profile.about_body !== "string") content.about_body = content.summary_body;
    if (typeof profile.about_body2 !== "string") content.about_body2 = content.summary_body2;
    content.resume_url = secureWordPressMediaUrl(content.resume_url);
    return content;
  } catch (error) {
    console.error("Unable to load WordPress professional profile", error);
    return fallback;
  }
}
