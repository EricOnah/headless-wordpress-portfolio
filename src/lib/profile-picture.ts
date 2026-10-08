import { fetchPortfolioContent } from "@/lib/wordpress-content";
import { secureWordPressMediaUrl } from "@/lib/wordpress-media";
export type ProfilePicture = { url: string; alt: string; name: string; headline: string };

const fallback: ProfilePicture = {
  url: "/profile-picture.jpg",
  alt: "Eric Onah",
  name: "Eric Onah",
  headline: "Full-stack Developer | WordPress | Headless CMS",
};

export async function getProfilePicture(): Promise<ProfilePicture> {
  const base = (
    process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL
  )?.replace(/\/$/, "").replace(/\/wp-json$/, "");
  if (!base) return fallback;

  try {
    const response = await fetchPortfolioContent(
      `${base}/?rest_route=/wp/v2/profile-pictures&status=publish&orderby=modified&order=desc&per_page=1`,
    );
    if (!response.ok) throw new Error(`Profile picture request failed: ${response.status}`);
    const entries: Array<{
      profile_image?: { url: string; alt: string } | null;
      profile_identity?: { name?: string; headline?: string };
    }> = await response.json();
    const entry = entries[0];
    if (!entry) return fallback;
    return {
      url: secureWordPressMediaUrl(entry.profile_image?.url || fallback.url),
      alt: entry.profile_image?.alt || fallback.alt,
      name: typeof entry.profile_identity?.name === "string" ? entry.profile_identity.name : fallback.name,
      headline: typeof entry.profile_identity?.headline === "string" ? entry.profile_identity.headline : fallback.headline,
    };
  } catch (error) {
    console.error("Unable to load WordPress profile picture", error);
    return fallback;
  }
}

