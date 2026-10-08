import { fetchPortfolioContent } from "@/lib/wordpress-content";
export const defaultFooterContent = {
  "name": "Eric Onah",
  "headline": "Full-stack Developer | WordPress | Headless CMS",
  "email": "ericdavid4u@gmail.com",
  "phone": "+2348108769293",
  "linkedin_label": "LinkedIn",
  "linkedin_url": "https://linkedin.com/in/eric-onah/",
  "github_label": "GitHub",
  "github_url": "https://github.com/EricOnah"
};
export type FooterContent = typeof defaultFooterContent;

export async function getFooterContent(): Promise<FooterContent> {
  const base = (process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "")
    .replace(/\/$/, "").replace(/\/wp-json$/, "");
  if (!base) return defaultFooterContent;
  try {
    const response = await fetchPortfolioContent(base + "/?rest_route=/wp/v2/footer-contents&status=publish&orderby=modified&order=desc&per_page=1");
    if (!response.ok) throw new Error("Footer request failed: " + response.status);
    const entries: Array<{ footer_data?: Partial<FooterContent> }> = await response.json();
    const fields = entries[0]?.footer_data;
    if (!fields) return defaultFooterContent;
    const content = { ...defaultFooterContent };
    for (const key of Object.keys(content) as Array<keyof FooterContent>) {
      if (typeof fields[key] === "string") content[key] = fields[key];
    }
    for (const key of ["linkedin_url", "github_url"] as const) {
      if (!/^https?:\/\//i.test(content[key])) content[key] = "";
    }
    return content;
  } catch (error) {
    console.error("Unable to load footer content", error);
    return defaultFooterContent;
  }
}
