
import { notFound } from "next/navigation";
import { getPublishedArticles, getPostsSection } from "@/lib/wordpress-posts";
import { PostsExplorer } from "@/components/posts-explorer";
import "@/components/posts.css";
export default async function CategoryPage({params}:{params:Promise<{slug:string}>}){
 const [{slug},data,section]=await Promise.all([params,getPublishedArticles(),getPostsSection()]);
 const category=data.posts.flatMap(p=>p.categories).find(c=>c.slug===slug);
 if(!category) notFound();
 return <main id="main-content" tabIndex={-1} className="post-category-page mx-auto max-w-6xl px-6 py-12"><PostsExplorer posts={data.posts.filter(p=>p.categories.some(c=>c.slug===slug))} section={section} available={data.available} categoryHeading={category.name}/></main>;
}
