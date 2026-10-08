
import { getPublishedArticles, getPostsSection } from "@/lib/wordpress-posts";
function xml(value:string){return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");}
export async function GET(request:Request){
 const [data,section]=await Promise.all([getPublishedArticles(),getPostsSection()]);
 if(!data.available) return new Response("Feed temporarily unavailable",{status:503});
 const origin=new URL(request.url).origin;
 const items=data.posts.map(p=>{
  const link=origin+"/posts/"+encodeURIComponent(p.slug);
  const date=new Date(p.date);
  return "<item><title>"+xml(p.title)+"</title><link>"+xml(link)+"</link><guid isPermaLink=\"true\">"+xml(link)+"</guid><description>"+xml(p.excerpt)+"</description>"+(Number.isNaN(date.getTime())?"":"<pubDate>"+date.toUTCString()+"</pubDate>")+"</item>";
 }).join("");
 const body='<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>'+xml(section.heading+" "+section.heading_accent)+"</title><link>"+xml(origin+"/posts")+"</link><description>"+xml(section.description)+"</description>"+items+"</channel></rss>";
 return new Response(body,{headers:{"Content-Type":"application/rss+xml; charset=utf-8","Cache-Control":"no-store"}});
}
