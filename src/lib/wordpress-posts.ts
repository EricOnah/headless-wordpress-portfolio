import { secureWordPressMediaUrl } from "@/lib/wordpress-media";

export type ArticleTerm = {id:number;name:string;slug:string};
export type WordPressArticle = {
 id:number;slug:string;title:string;excerpt:string;content:string;date:string;sticky:boolean;
 featuredImage:string;featuredImageAlt:string;categories:ArticleTerm[];tags:ArticleTerm[];readingMinutes:number;
};
export const defaultPostsSection = {
  "eyebrow": "// Posts & engineering log",
  "heading": "Notes and",
  "heading_accent": "case studies",
  "description": "Practical notes on WordPress development, headless architectures, and modern web experiences.",
  "source_label": "Published from WordPress",
  "back_label": "Back home",
  "feed_label": "RSS feed",
  "total_label": "Total published",
  "read_time_label": "Average read time",
  "publishing_label": "Publishing",
  "publishing_value": "WordPress",
  "all_label": "All articles",
  "latest_label": "Latest WordPress notes",
  "archive_label": "Article archive",
  "search_placeholder": "Search notes, topics, or technologies...",
  "view_label": "View",
  "empty_heading": "No published posts yet",
  "empty_description": "New notes and articles will appear here soon.",
  "no_results": "No articles match your search.",
  "error_heading": "Articles are temporarily unavailable",
  "error_description": "Please try again shortly.",
  "principles_label": "// Under the hood",
  "principles_heading": "Headless publishing principles",
  "principles_description": "A flexible publishing workflow with WordPress content and a modern frontend.",
  "principles": "CMS-managed publishing | Write articles, organise categories and tags, and choose featured images in WordPress. | Editorial control\nStructured content delivery | Published content is delivered through the WordPress REST API and mapped to typed frontend data. | Clear content models\nPublish and refresh | The frontend reads published content without caching, so saved changes appear on the next page refresh. | Up-to-date content",
  "cta_label": "Open for projects & opportunities",
  "cta_heading": "Looking for architectural guidance or a developer for your team?",
  "cta_description": "Let’s discuss your WordPress project, headless integration, or full-stack development opportunity.",
  "feed_button_label": "Subscribe via RSS",
  "contact_label": "Start a conversation",
  "contact_url": "/contact"
};
export type PostsSectionContent = typeof defaultPostsSection;
type RawPost = {
 id:number;slug:string;date:string;date_gmt?:string;sticky?:boolean;
 portfolio_post_data:{title:string;excerpt:string;content:string;reading_minutes:number};
 _embedded?:{
  "wp:featuredmedia"?:Array<{source_url?:string;alt_text?:string}>;
  "wp:term"?:Array<Array<ArticleTerm & {taxonomy:string}>>;
 };
};
function baseUrl(){
 return (process.env.WORDPRESS_API_URL||process.env.NEXT_PUBLIC_WORDPRESS_API_URL||"").replace(/\/$/,"").replace(/\/wp-json$/,"");
}
function safeUrl(value:string){return /^https?:\/\//i.test(value)||/^\/(?!\/)/.test(value)?value:"";}
async function request(base:string,route:string){
 const response=await fetch(base+"/?rest_route=/wp/v2/"+route,{cache:"no-store",signal:AbortSignal.timeout(8000)});
 if(!response.ok) throw new Error("WordPress posts request failed: "+response.status);
 return response;
}
function normalize(post:RawPost):WordPressArticle{
 const d=post.portfolio_post_data;
 if(!d) throw new Error("Portfolio Posts plugin is required for published article data.");
 const terms=(post._embedded?.["wp:term"]||[]).flat();
 const image=post._embedded?.["wp:featuredmedia"]?.[0];
 return {
  id:post.id,slug:post.slug,title:d.title,excerpt:d.excerpt,content:d.content,date:post.date_gmt?post.date_gmt+"Z":post.date,sticky:post.sticky===true,
  featuredImage:secureWordPressMediaUrl(safeUrl(image?.source_url||"")),featuredImageAlt:image?.alt_text||d.title,
  categories:terms.filter(t=>t.taxonomy==="category").map(({id,name,slug})=>({id,name,slug})),
  tags:terms.filter(t=>t.taxonomy==="post_tag").map(({id,name,slug})=>({id,name,slug})),
  readingMinutes:Math.max(1,Number(d.reading_minutes)||1),
 };
}
export async function getPublishedArticles():Promise<{posts:WordPressArticle[];available:boolean}>{
 const base=baseUrl();
 if(!base) return {posts:[],available:false};
 try{
  const posts:WordPressArticle[]=[];
  for(let page=1;;page++){
   const response=await request(base,"posts&status=publish&_embed=1&orderby=date&order=desc&per_page=100&page="+page);
   const entries:RawPost[]=await response.json();
   posts.push(...entries.map(normalize));
   if(page>=Number(response.headers.get("X-WP-TotalPages")||1)) break;
  }
  return {posts,available:true};
 }catch(error){console.error("Unable to load published WordPress articles",error);return {posts:[],available:false};}
}
export async function getPostsSection():Promise<PostsSectionContent>{
 const base=baseUrl();
 if(!base) return defaultPostsSection;
 try{
  const response=await request(base,"posts-sections&status=publish&orderby=modified&order=desc&per_page=1");
  const entries:Array<{posts_section_data:Partial<PostsSectionContent>}>=await response.json();
  const fields=entries[0]?.posts_section_data;
  const section={...defaultPostsSection};
  if(fields) for(const key of Object.keys(section) as Array<keyof PostsSectionContent>){
   if(typeof fields[key]==="string") section[key]=fields[key];
  }
  section.contact_url=safeUrl(section.contact_url);
  return section;
 }catch(error){console.error("Unable to load Posts page content",error);return defaultPostsSection;}
}
export async function getPublishedArticleBySlug(slug:string):Promise<WordPressArticle|null>{
 const base=baseUrl();
 if(!base||!slug) return null;
 const response=await request(base,"posts&status=publish&slug="+encodeURIComponent(slug)+"&_embed=1");
 const entries:RawPost[]=await response.json();
 return entries[0]?normalize(entries[0]):null;
}
export function latestArticles(posts:WordPressArticle[]){
 const sticky=posts.filter(p=>p.sticky);
 return sticky.length?sticky:posts.slice(0,4);
}
export function filterArticles(posts:WordPressArticle[],filter:string,query:string,latestIds:Set<number>){
 const search=query.trim().toLowerCase();
 return posts.filter(p=>{
  const matches=filter==="all"||filter==="latest"&&latestIds.has(p.id)||p.categories.some(c=>"category:"+c.slug===filter);
  const haystack=[p.title,p.excerpt,...p.tags.map(t=>t.name),...p.categories.map(c=>c.name)].join(" ").toLowerCase();
  return matches&&(!search||haystack.includes(search));
 });
}
