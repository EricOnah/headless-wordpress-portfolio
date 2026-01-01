import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/project-card";
import {
  getPostCategories,
  getPostsByCategorySlug,
  hasWordPressPostsSource,
  type WpCategory,
} from "@/lib/wordpress";

export const revalidate = 300;

type PageParams = { slug: string } | Promise<{ slug: string }>;

async function resolveParams(params: PageParams) {
  return await Promise.resolve(params);
}

export default async function CategoryPage({ params }: { params: PageParams }) {
  const { slug } = await resolveParams(params);
  const hasSource = hasWordPressPostsSource;

  if (!hasSource) {
    notFound();
  }

  const [categories, posts] = await Promise.all([
    getPostCategories(),
    getPostsByCategorySlug(slug, 12),
  ]);

  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              Posts
            </p>
            <h1 className="text-3xl font-semibold text-white">{category.name}</h1>
            <p className="text-sm text-slate-200/80">
              WordPress posts filtered by category{category.count ? ` (${category.count})` : ""}.
            </p>
          </div>
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/30 hover:bg-white/10"
          >
            <span aria-hidden>←</span>
            Back to posts
          </Link>
        </div>

        {posts.length ? (
          <section className="space-y-4">
            {category.slug === "uncategorized" ? (
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                  Posts
                </p>
                <h2 className="text-2xl font-semibold text-white">Uncategorized</h2>
              </div>
            ) : null}
            <div className="grid gap-5 md:grid-cols-2">
              {posts.map((post) => (
                <ProjectCard key={post.id} project={post} hrefBase="/posts" />
              ))}
            </div>
          </section>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/85">
            <p className="text-sm font-semibold text-white">No posts in this category</p>
            <p className="mt-2">Check back soon for updates.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const categories = await getPostCategories();
  return categories.slice(0, 10).map((cat: WpCategory) => ({ slug: cat.slug }));
}
