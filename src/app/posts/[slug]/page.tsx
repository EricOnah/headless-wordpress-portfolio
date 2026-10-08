/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedArticleBySlug } from "@/lib/wordpress-posts";

export const revalidate = 300;

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type PageParams = { slug: string } | Promise<{ slug: string }>;

async function resolveParams(params: PageParams) {
  return await Promise.resolve(params);
}

export default async function PostDetailPage({ params }: { params: PageParams }) {
  const { slug } = await resolveParams(params);
  const post = await getPublishedArticleBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-black text-slate-50">
      <main id="main-content" tabIndex={-1} className="post-detail-page mx-auto max-w-4xl px-6 py-10 space-y-8">
        <article id="post-article" aria-labelledby="article-heading" className="post-article space-y-8">
        <header id="post-header" className="post-header flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Article</p>
            <h1 id="article-heading" className="text-3xl font-semibold text-white">{post.title}</h1>
            <p className="text-sm text-slate-200/80">Published <time dateTime={post.date}>{formatDate(post.date)}</time></p>
            {post.categories && post.categories.length ? (
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                {post.categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/posts/categories/${cat.slug}`}
                    className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10 transition hover:bg-white/15 hover:text-emerald-200"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/30 hover:bg-white/10"
          >
            <span aria-hidden>←</span>
            Back
          </Link>
        </header>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.9)] backdrop-blur">
          {post.featuredImage ? (
            <div className="relative h-72 w-full overflow-hidden">
              <img
                src={post.featuredImage}
                alt={post.featuredImageAlt ?? post.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            </div>
          ) : null}

          <div className="space-y-6 p-8">
            <p className="text-lg leading-relaxed text-slate-100">{post.excerpt}</p>
            <div
              className="post-body rich-text rounded-2xl bg-white p-6 text-base shadow-inner shadow-slate-200/60"
              dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
            />
          </div>
        </div>

        </article>

        <aside id="next-steps" aria-labelledby="article-next-steps" className="next-steps rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-100 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.9)]">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
            Next steps
          </p>
          <h2 id="article-next-steps" className="mt-2 text-lg font-semibold text-white">
            Want help implementing these ideas?
          </h2>
          <p className="mt-2 text-slate-200/85">
            I ship secure, performant WordPress, headless, and Next.js builds with the right mix of CMS workflows and front-end optimizations.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-white-dark">
              Start a project
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/40 hover:bg-white/10"
            >
              View portfolio
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
}
