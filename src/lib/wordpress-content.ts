import { cache } from "react";

type Collection = { status: number; body: unknown; total_pages: number };
type ContentBundle = { collections: Record<string, Collection> };

// React invalidates this memoization on EVERY server request. No persistent
// content cache: components in one render share a single fresh CMS response.
const getBundle = cache(async (base: string): Promise<ContentBundle | null> => {
  const response = await fetch(`${base}/?rest_route=/portfolio/v1/content`, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  // Allows frontend/backend rollout independently on older installations.
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`WordPress content request failed: ${response.status}`);
  const bundle: ContentBundle = await response.json();
  if (!bundle?.collections || typeof bundle.collections !== "object") {
    throw new Error("Invalid WordPress content response");
  }
  return bundle;
});

const lists = new Set(["skill-categories", "experience-roles", "portfolio-projects"]);
const supported = new Set([
  "profile-pictures", "professional-profiles", "homepage-heroes", "footer-contents",
  "skills-sections", "skill-categories", "experience-sections", "experience-roles",
  "project-sections", "portfolio-projects", "education-profiles", "contact-pages",
]);

export async function fetchPortfolioContent(url: string): Promise<Response> {
  const parsed = new URL(url);
  const route = parsed.searchParams.get("rest_route")?.replace(/^\/wp\/v2\//, "") ?? "";
  const expected: Record<string, string> = {
    status: "publish", context: "view", page: "1", per_page: lists.has(route) ? "100" : "1",
    orderby: lists.has(route) ? "menu_order" : "modified", order: lists.has(route) ? "asc" : "desc",
  };
  // Different pages, filters, and pagination must use the original REST query.
  const compatible = supported.has(route) && Array.from(parsed.searchParams).every(
    ([key, value]) => key === "rest_route" || expected[key] === value,
  );
  if (compatible) {
    const base = url.slice(0, url.indexOf("/?"));
    const bundle = await getBundle(base);
    const collection = bundle?.collections[route];
    if (collection) {
      return Response.json(collection.body, {
        status: collection.status,
        headers: { "X-WP-TotalPages": String(collection.total_pages), "Cache-Control": "no-store" },
      });
    }
  }
  return fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
}
