import { getButtonLabels } from "@/lib/button-labels";

import { getPublishedArticles, getPostsSection } from "@/lib/wordpress-posts";
import { PostsExplorer } from "@/components/posts-explorer";
import "@/components/posts.css";
type Props={searchParams?:Promise<{view?:string|string[]}>};
export default async function PostsPage({searchParams}:Props){
 const [data,section,params]=await Promise.all([getPublishedArticles(),getPostsSection(),searchParams]);
 const view=params?.view;
 return <main id="main-content" tabIndex={-1} className="posts-page mx-auto max-w-6xl px-6 py-12"><PostsExplorer labels={await getButtonLabels("posts")} posts={data.posts} section={section} available={data.available} initialFilter={view==="latest"||Array.isArray(view)&&view.includes("latest")?"latest":"all"}/></main>;
}
