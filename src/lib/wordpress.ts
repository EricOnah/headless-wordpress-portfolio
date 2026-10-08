// WordPress data helpers for pulling posts as portfolio projects.
const USE_MANUAL_PROJECTS = true;

const REST_API_BASE =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace(/\/$/, "") ?? null;
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL?.replace(/\/$/, "") ?? null;

export const hasWordPressSource =
  !USE_MANUAL_PROJECTS && Boolean(REST_API_BASE || GRAPHQL_URL);

export const hasWordPressPostsSource = Boolean(REST_API_BASE || GRAPHQL_URL);

type WpRendered = {
  rendered: string;
};

type WpPost = {
  id: number;
  slug: string;
  date: string;
  title: WpRendered;
  excerpt: WpRendered;
  content: WpRendered;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url?: string;
      alt_text?: string;
    }>;
    "wp:term"?: Array<
      Array<{
        name?: string;
        slug?: string;
        taxonomy?: string;
      }>
    >;
  };
};

export type Project = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  tags: string[];
  date: string;
  categories?: WpCategory[];
};

export type WpCategory = {
  id: number;
  name: string;
  slug: string;
  count?: number;
};

const MANUAL_PROJECTS: Project[] = [
  {
    id: 1,
    slug: "flash-sale-ecommerce",
    title: "Flash-sale ecommerce rebuild for a clearance retailer",
    excerpt:
      "Built a conversion-focused storefront for a national clearance brand with sale scheduling, resilient checkout, and real-time inventory.",
    content: `<p>Delivered a headless commerce experience that keeps limited-quantity drops stable during spikes. Product data flows into React components from the CMS, with ISR and cache busting keyed to sale start times so shoppers always see accurate pricing and quantities.</p><p>Checkout runs through Stripe with address validation and fraud signals surfaced to ops. We layered in bundle rules, smarter search facets, and a promo engine so marketing can launch campaigns without developer support.</p>`,
    featuredImage:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    featuredImageAlt: "Online shopping cart experience on a laptop",
    tags: ["Ecommerce", "Headless WordPress", "Stripe", "Performance"],
    date: "2024-10-02",
  },
  {
    id: 2,
    slug: "real-estate-portfolio",
    title: "Property and architecture portfolio site",
    excerpt:
      "Showcased a luxury architecture and real estate studio with property highlights, credentials, and lead capture built into the CMS.",
    content: `<p>Crafted editorial-style property pages with hero media, neighborhood context, and amenities pulled from structured WordPress fields. Sales can spin up new listings with PDF brochure exports while keeping layouts consistent.</p><p>Added map-driven search, CRM handoff, and appointment scheduling so prospective buyers get from inspiration to conversation quickly. Performance stays high with ISR and image optimization tuned for large photography.</p>`,
    featuredImage:
      "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80",
    featuredImageAlt: "Modern luxury home exterior at dusk",
    tags: ["Real estate", "Architecture", "Lead capture", "WordPress CMS"],
    date: "2024-07-12",
  },
  {
    id: 3,
    slug: "football-club-digital",
    title: "Top-flight football club digital home",
    excerpt:
      "Built a fast match-day hub with live scores, fixtures, ticketing, and membership flows tailored for supporters on any device.",
    content: `<p>Integrated fixtures and standings data into reusable blocks that editors can reorder before each match. The match center revalidates on a short interval for live scores while keeping static assets cached worldwide.</p><p>Delivered membership signup, merchandising callouts, and sponsorship slots, plus accessibility adjustments for fans navigating on lower-end mobile devices and stadium Wi-Fi.</p>`,
    featuredImage:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    featuredImageAlt: "Close-up of a football on a pitch at sunset",
    tags: ["Sports", "Live data", "Ticketing", "Localization"],
    date: "2024-05-28",
  },
  {
    id: 4,
    slug: "interior-design-showcase",
    title: "Corporate site for an interior design group",
    excerpt:
      "Elevated a boutique interior design firm with moodboard-inspired case studies, service breakdowns, and polished lead forms.",
    content: `<p>Built a modular page system so the team can mix hero video, material swatches, before-and-after galleries, and testimonial sliders without developer help. Each case study highlights space planning, finishes, and vendor partners while keeping the visual language consistent.</p><p>We tightened SEO metadata, added structured data for projects, and routed inquiries to the right studio lead, lifting qualified contact volume week over week.</p>`,
    featuredImage:
      "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1200&q=80",
    featuredImageAlt: "Minimalist interior design workspace",
    tags: ["Corporate site", "Design system", "SEO", "Next.js"],
    date: "2024-03-01",
  },
];

const MANUAL_POSTS: Project[] = [
  {
    id: 101,
    slug: "wordpress-scalable-stacks",
    title: "Building scalable WordPress stacks",
    excerpt:
      "How to structure themes, plugins, and hosting for uptime, speed, and safer releases.",
    content: `<p>WordPress scales best when you keep the theme lean, push heavy lifting to plugins, and treat deployments like any other modern app. That means git-based releases, CI checks, and zero-downtime deploys.</p><p>Add object caching, page caching, image CDNs, and a disciplined approach to database queries. Use environment-specific configs to keep secrets out of the repo, and guard against plugin bloat with code reviews.</p><p>Pair this with monitoring, WAF rules, and regular dependency updates, and you get a WordPress stack that can handle traffic bursts without surprises.</p>`,
    featuredImage:
      "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1200&q=80",
    featuredImageAlt: "Laptop with code editor and system diagrams",
    tags: ["WordPress", "Scaling", "DevOps", "Performance"],
    date: "2024-10-10",
  },
  {
    id: 102,
    slug: "headless-cms-playbook",
    title: "Headless CMS playbook for teams",
    excerpt:
      "When to go headless, how to model content, and how to keep editors happy while shipping fast front-ends.",
    content: `<p>Go headless when you need multi-channel delivery, modern front-end ergonomics, or complex orchestration that traditional themes fight against. Start with a stable content model: clear types, shared blocks, and guarded schemas to keep editors safe.</p><p>For WordPress, map Gutenberg blocks to React components, enforce validation, and add preview APIs so editors see what they ship. Add caching at the edge, use ISR for freshness, and instrument performance budgets.</p><p>Success comes from clear ownership: content modelers, front-end devs, and platform folks each have a lane. Keep documentation close to the CMS so editors always have guidance.</p>`,
    featuredImage:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    featuredImageAlt: "Design system cards representing headless CMS building blocks",
    tags: ["Headless CMS", "Content modeling", "Editor UX"],
    date: "2024-10-05",
  },
  {
    id: 103,
    slug: "nextjs-for-wordpress",
    title: "Next.js patterns for WordPress front-ends",
    excerpt:
      "ISR, draft previews, and routing patterns that keep headless WordPress sites fast and maintainable.",
    content: `<p>Use incremental static regeneration for pages that benefit from caching and predictable rebuilds. Pair it with webhook-driven revalidation for near-real-time updates after editors publish.</p><p>Draft mode enables content previews without exposing unpublished data. Keep your data layer typed, normalize WordPress responses, and reuse page-level layouts so routes stay predictable.</p><p>Bundle images through next/image or a CDN, and lean on dynamic imports for heavier components. Result: quick TTFB, smooth navigation, and happier editors.</p>`,
    featuredImage:
      "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80",
    featuredImageAlt: "Code editor with React and Next.js snippets",
    tags: ["Next.js", "ISR", "Preview", "Headless WordPress"],
    date: "2024-10-03",
  },
  {
    id: 104,
    slug: "rest-api-architecture",
    title: "REST API architecture for WordPress builds",
    excerpt:
      "Designing stable endpoints, authentication, and caching for headless WordPress consumers.",
    content: `<p>Start with clean, versioned endpoints that return only what the client needs. Use custom routes for complex joins, and keep responses predictable with typed contracts shared across teams.</p><p>Harden authentication with application passwords or JWT, and rate-limit public endpoints. Add server-side caching plus ETags or cache keys so clients avoid unnecessary fetches.</p><p>Document endpoints inline and maintain a changelog. The result is a resilient API surface that front-ends can trust release after release.</p>`,
    featuredImage:
      "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80",
    featuredImageAlt: "API flow diagrams on a laptop screen",
    tags: ["REST API", "Security", "Caching", "Contracts"],
    date: "2024-10-01",
  },
];

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

async function fetchFromRest<T>(path: string): Promise<T> {
  if (!REST_API_BASE) {
    throw new Error("WordPress API URL is not configured.");
  }

  const response = await fetch(`${REST_API_BASE}${path}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`WordPress request failed with ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      `WordPress response was not JSON (content-type: ${contentType}). Body preview: ${bodyText.slice(0, 200)}`,
    );
  }

  try {
    return JSON.parse(bodyText) as T;
  } catch (error) {
    throw new Error(`Failed to parse WordPress JSON: ${error}`);
  }
}

function normalizeProject(post: WpPost): Project {
  const featured = post._embedded?.["wp:featuredmedia"]?.[0];
  const tagGroups = post._embedded?.["wp:term"] ?? [];
  const tags =
    tagGroups
      .flatMap((group) => group)
      .map((term) => term.name)
      .filter((name): name is string => typeof name === "string" && name.length > 0) || [];
  const categories =
    tagGroups
      .flatMap((group) => group)
      .filter((term) => term.taxonomy === "category" && term.slug && term.name)
      .map((term) => ({
        id: term.slug!.length,
        name: term.name as string,
        slug: term.slug as string,
      })) || [];

  return {
    id: post.id,
    slug: post.slug,
    title: stripHtml(post.title?.rendered ?? "Untitled"),
    excerpt: stripHtml(post.excerpt?.rendered ?? "").slice(0, 180),
    content: post.content?.rendered ?? "",
    featuredImage: featured?.source_url,
    featuredImageAlt:
      featured?.alt_text || stripHtml(post.title?.rendered ?? "Project image"),
    tags: tags.length ? tags : ["Headless WordPress"],
    date: post.date,
    categories,
  };
}

type GqlPost = {
  databaseId: number;
  slug: string;
  date: string;
  title: string;
  excerpt?: string;
  content?: string;
  featuredImage?: { node?: { sourceUrl?: string; altText?: string | null } | null } | null;
  tags?: { nodes?: Array<{ name?: string | null }> | null } | null;
};

type GqlResponse = {
  data?: {
    posts?: {
      nodes?: GqlPost[];
    };
    categories?: {
      nodes?: Array<{ name?: string | null; slug?: string | null; count?: number | null }>;
    };
  };
};

async function fetchFromGraphQL(limit: number): Promise<Project[]> {
  if (!GRAPHQL_URL) {
    throw new Error("WordPress GraphQL URL is not configured.");
  }

  const query = `
    query GetPortfolioPosts($limit: Int!) {
      posts(first: $limit, where: { status: PUBLISH }) {
        nodes {
          databaseId
          slug
          date
          title
          excerpt
          content
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          tags {
            nodes {
              name
            }
          }
        }
      }
      categories(first: 50, where: { hideEmpty: true }) {
        nodes {
          name
          slug
          count
        }
      }
    }
  `;

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { limit } }),
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed with ${response.status}`);
  }

  const json: GqlResponse = await response.json();
  const nodes = json.data?.posts?.nodes ?? [];

  return nodes.map((node) => {
    const tags =
      node.tags?.nodes?.map((tag) => tag?.name).filter((name): name is string => typeof name === "string" && name.length > 0) ?? [];

    return {
      id: node.databaseId,
      slug: node.slug,
      title: stripHtml(node.title ?? "Untitled"),
      excerpt: stripHtml(node.excerpt ?? "").slice(0, 180),
      content: node.content ?? "",
      featuredImage: node.featuredImage?.node?.sourceUrl,
      featuredImageAlt:
        node.featuredImage?.node?.altText ??
        stripHtml(node.title ?? "Project image"),
      tags: tags.length ? tags : ["Headless WordPress"],
      date: node.date,
    };
  });
}

export async function getProjects(limit = 6): Promise<Project[]> {
  try {
    if (USE_MANUAL_PROJECTS) {
      return MANUAL_PROJECTS.slice(0, limit);
    }

    if (GRAPHQL_URL) {
      return await fetchFromGraphQL(limit);
    }

    if (REST_API_BASE) {
      const posts = await fetchFromRest<WpPost[]>(
        `/?rest_route=/wp/v2/posts&status=publish&_embed=1&per_page=${limit}`,
      );
      return posts.map(normalizeProject);
    }

    return MANUAL_PROJECTS.slice(0, limit);
  } catch (error) {
    console.error("Falling back to manual projects", error);
    return MANUAL_PROJECTS.slice(0, limit);
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!slug) return null;

  try {
    if (USE_MANUAL_PROJECTS) {
      return MANUAL_PROJECTS.find((project) => project.slug === slug) ?? null;
    }

    if (GRAPHQL_URL) {
      const results = await fetchFromGraphQL(20);
      return results.find((project) => project.slug === slug) ?? null;
    }

    if (REST_API_BASE) {
      const posts = await fetchFromRest<WpPost[]>(
        `/?rest_route=/wp/v2/posts&slug=${encodeURIComponent(slug)}&_embed=1`,
      );
      const post = posts[0];
      return post ? normalizeProject(post) : null;
    }

    return MANUAL_PROJECTS.find((project) => project.slug === slug) ?? null;
  } catch (error) {
    console.error(`Unable to load project ${slug}`, error);
    return MANUAL_PROJECTS.find((project) => project.slug === slug) ?? null;
  }
}

export async function getPosts(limit = 6): Promise<Project[]> {
  try {
    if (USE_MANUAL_PROJECTS) {
      return MANUAL_POSTS.slice(0, limit);
    }

    if (GRAPHQL_URL) {
      const results = await fetchFromGraphQL(limit);
      return results;
    }

    if (REST_API_BASE) {
      const posts = await fetchFromRest<WpPost[]>(
        `/?rest_route=/wp/v2/posts&status=publish&_embed=1&per_page=${limit}`,
      );
      return posts.map(normalizeProject);
    }

    return MANUAL_POSTS.slice(0, limit);
  } catch (error) {
    console.error("Falling back to manual posts", error);
    return MANUAL_POSTS.slice(0, limit);
  }
}

export async function getPostBySlug(slug: string): Promise<Project | null> {
  if (!slug) return null;

  try {
    if (hasWordPressPostsSource) {
      if (GRAPHQL_URL) {
        const results = await fetchFromGraphQL(20);
        const match = results.find((project) => project.slug === slug);
        if (match) return match;
      }

      if (REST_API_BASE) {
        const posts = await fetchFromRest<WpPost[]>(
          `/?rest_route=/wp/v2/posts&slug=${encodeURIComponent(slug)}&_embed=1`,
        );
        const post = posts[0];
        if (post) return normalizeProject(post);
      }
    }

    if (USE_MANUAL_PROJECTS) {
      return MANUAL_POSTS.find((post) => post.slug === slug) ?? null;
    }

    return null;
  } catch (error) {
    console.error(`Unable to load post ${slug}`, error);
    return MANUAL_POSTS.find((post) => post.slug === slug) ?? null;
  }
}

export async function getPostCategories(): Promise<WpCategory[]> {
  try {
    if (GRAPHQL_URL) {
      const query = `
        query GetCategories {
          categories(first: 50, where: { hideEmpty: true }) {
            nodes {
              name
              slug
              count
            }
          }
        }
      `;

      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        next: { revalidate: 300 },
      });

      if (!response.ok) throw new Error(`GraphQL categories failed with ${response.status}`);

      const json: GqlResponse = await response.json();
      const nodes = json.data?.categories?.nodes ?? [];
      return nodes
        .filter((node) => node?.name && node?.slug)
        .map((node) => ({
          id: node.slug ? node.slug.length : 0,
          name: node.name as string,
          slug: node.slug as string,
          count: node.count ?? undefined,
        }));
    }

    if (REST_API_BASE) {
      const cats = await fetchFromRest<WpCategory[]>(
        `/?rest_route=/wp/v2/categories&per_page=50&hide_empty=true`,
      );
      return cats;
    }

    return [];
  } catch (error) {
    console.error("Unable to load categories", error);
    return [];
  }
}

export async function getPostsByCategorySlug(slug: string, limit = 12): Promise<Project[]> {
  if (!slug) return [];

  try {
    if (GRAPHQL_URL) {
      const query = `
        query GetPostsByCategory($slug: String!, $limit: Int!) {
          posts(first: $limit, where: { status: PUBLISH, categoryName: $slug }) {
            nodes {
              databaseId
              slug
              date
              title
              excerpt
              content
              featuredImage {
                node {
                  sourceUrl
                  altText
                }
              }
              tags {
                nodes {
                  name
                }
              }
            }
          }
        }
      `;

      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { slug, limit } }),
        next: { revalidate: 300 },
      });

      if (!response.ok) throw new Error(`GraphQL posts by category failed with ${response.status}`);

      const json: GqlResponse = await response.json();
      const nodes = json.data?.posts?.nodes ?? [];
      const tags =
        nodes.flatMap((n) => n.tags?.nodes?.map((t) => t?.name || "").filter(Boolean) || []) || [];

      return nodes.map((node) => ({
        id: node.databaseId,
        slug: node.slug,
        title: stripHtml(node.title ?? "Untitled"),
        excerpt: stripHtml(node.excerpt ?? "").slice(0, 180),
        content: node.content ?? "",
        featuredImage: node.featuredImage?.node?.sourceUrl,
        featuredImageAlt: node.featuredImage?.node?.altText ?? stripHtml(node.title ?? "Project image"),
        tags: tags.length ? tags : ["WordPress"],
        date: node.date,
      }));
    }

    if (REST_API_BASE) {
      const cats = await getPostCategories();
      const cat = cats.find((c) => c.slug === slug);
      if (!cat) return [];

      const posts = await fetchFromRest<WpPost[]>(
        `/?rest_route=/wp/v2/posts&status=publish&_embed=1&per_page=${limit}&categories=${cat.id}`,
      );
      return posts.map(normalizeProject);
    }

    return [];
  } catch (error) {
    console.error(`Unable to load posts for category ${slug}`, error);
    return [];
  }
}

export async function getWordPressPosts(limit = 6, fallbackToManual = false): Promise<Project[]> {
  try {
    if (GRAPHQL_URL) {
      const results = await fetchFromGraphQL(limit);
      return results;
    }

    if (REST_API_BASE) {
      const posts = await fetchFromRest<WpPost[]>(
        `/?rest_route=/wp/v2/posts&status=publish&_embed=1&per_page=${limit}`,
      );
      return posts.map(normalizeProject);
    }

    return fallbackToManual ? MANUAL_POSTS.slice(0, limit) : [];
  } catch (error) {
    console.error("Unable to fetch WordPress posts", error);
    return fallbackToManual ? MANUAL_POSTS.slice(0, limit) : [];
  }
}
