import { certifications, education } from "@/lib/content";

export const defaultEducationProfile = {
  education_label: "Education",
  education_heading: "Academic foundation",
  degree: education.degree,
  school: education.school,
  period: education.period,
  certifications_label: "Certifications",
  certifications_heading: "Proof of capability",
  certifications: certifications.join("\n"),
  certification_status: "Earned",
};
export type EducationProfile = typeof defaultEducationProfile;

export async function getEducationProfile(): Promise<EducationProfile> {
  const base = (process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "")
    .replace(/\/$/, "").replace(/\/wp-json$/, "");
  if (!base) return defaultEducationProfile;
  try {
    const response = await fetch(
      base + "/?rest_route=/wp/v2/education-profiles&status=publish&orderby=modified&order=desc&per_page=1",
      { cache: "no-store", signal: AbortSignal.timeout(5000) },
    );
    if (!response.ok) throw new Error("Education request failed: " + response.status);
    const entries: Array<{ education_data?: Partial<EducationProfile> }> = await response.json();
    const fields = entries[0]?.education_data;
    if (!fields) return defaultEducationProfile;
    const profile = { ...defaultEducationProfile };
    for (const key of Object.keys(profile) as Array<keyof EducationProfile>) {
      if (typeof fields[key] === "string") profile[key] = fields[key];
    }
    return profile;
  } catch (error) {
    console.error("Unable to load WordPress education profile", error);
    return defaultEducationProfile;
  }
}