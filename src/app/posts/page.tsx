import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { getPostCategories, getPosts, getWordPressPosts, hasWordPressPostsSource } from "@/lib/wordpress";

export const revalidate = 300;

type PostsPageProps = {
  searchParams?: { view?: string | string[] } | Promise<{ view?: string | string[] }>;
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const [posts, categories, latestNotes] = await Promise.all([
    getWordPressPosts(12, false),
    getPostCategories(),
    getPosts(4),
  ]);
  const hasSource = hasWordPressPostsSource;
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const viewParam = resolvedSearchParams?.view;
  const latestOnly = Array.isArray(viewParam)
    ? viewParam.includes("latest")
    : viewParam === "latest";
  const categoryOrder = categories.map((cat) => ({
    slug: cat.slug,
    name: cat.name,
  }));
  const groupedPosts = new Map<string, { slug: string; name: string; posts: typeof posts }>();

  posts.forEach((post) => {
    const primaryCategory = post.categories?.length
      ? post.categories[0]
      : { slug: "uncategorized", name: "Uncategorized" };
    const group = groupedPosts.get(primaryCategory.slug) ?? {
      slug: primaryCategory.slug,
      name: primaryCategory.name,
      posts: [],
    };

    group.posts.push(post);
    groupedPosts.set(primaryCategory.slug, group);
  });

  const orderedGroups = [
    ...categoryOrder
      .map((cat) => groupedPosts.get(cat.slug))
      .filter((group): group is { slug: string; name: string; posts: typeof posts } => Boolean(group)),
    ...Array.from(groupedPosts.values()).filter(
      (group) => !categoryOrder.some((cat) => cat.slug === group.slug),
    ),
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Posts</p>
            <h1 className="text-3xl font-semibold text-white">Notes and case studies</h1>
            <p className="text-sm text-slate-200/80">
              {hasSource
                ? "Live from WordPress REST / WPGraphQL."
                : "Connect NEXT_PUBLIC_WORDPRESS_API_URL or NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL to load posts."}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/30 hover:bg-white/10"
          >
            <span aria-hidden>←</span>
            Back home
          </Link>
        </div>

        {hasSource && categories.length ? (
          <div className="flex flex-wrap gap-2">
            {latestNotes.length ? (
              <Link
                href={{ pathname: "/posts", query: { view: "latest" } }}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  latestOnly
                    ? "border-emerald-300/60 bg-emerald-300/20 text-emerald-100"
                    : "border-white/10 bg-white/5 text-emerald-100 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                Latest WordPress notes
              </Link>
            ) : null}
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/posts/categories/${cat.slug}`}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100 transition hover:border-white/30 hover:bg-white/10"
              >
                {cat.name} {cat.count ? `(${cat.count})` : ""}
              </Link>
            ))}
          </div>
        ) : null}

        {latestNotes.length ? (
          <section id="latest-wordpress-notes" className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Posts</p>
              <h2 className="text-2xl font-semibold text-white">Latest WordPress notes</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {latestNotes.map((post) => (
                <ProjectCard key={post.id} project={post} hrefBase="/posts" />
              ))}
            </div>
          </section>
        ) : null}

        {!latestOnly && posts.length ? (
          <div className="space-y-8">
            {orderedGroups.map((group) => (
              <section key={group.slug} className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                    Posts
                  </p>
                  <h2 className="text-2xl font-semibold text-white">{group.name}</h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {group.posts.map((post) => (
                    <ProjectCard key={post.id} project={post} hrefBase="/posts" />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : !latestOnly ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/85">
            <p className="text-sm font-semibold text-white">No WordPress posts yet</p>
            <p className="mt-2">
              Add NEXT_PUBLIC_WORDPRESS_API_URL or NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL to load live posts.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
