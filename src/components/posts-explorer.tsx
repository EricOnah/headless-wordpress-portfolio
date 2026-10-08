
/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useId, useState } from "react";
import { filterArticles, latestArticles, type WordPressArticle, type PostsSectionContent } from "@/lib/wordpress-posts";
function dateLabel(value:string){
 const date=new Date(value);
 return Number.isNaN(date.getTime())?"":date.toLocaleDateString("en-US",{month:"short",year:"numeric",timeZone:"UTC"});
}
export function PostNoteCard({post,viewLabel}:{post:WordPressArticle;viewLabel:string}){
 const id=useId();
 return <article className="posts-note" aria-labelledby={id + "-title"}>
  <div className="posts-note-main"><div className="posts-note-copy">
   <div className="posts-meta"><span>{post.categories[0]?.name||"Article"}</span><time dateTime={post.date}>{dateLabel(post.date)}</time><span>{post.readingMinutes} min read</span></div>
   <h3 id={id + "-title"}><Link href={"/posts/"+post.slug}>{post.title}</Link></h3><p>{post.excerpt}</p>
  </div>{post.featuredImage&&<Link href={"/posts/"+post.slug} className="posts-image" tabIndex={-1} aria-hidden="true"><img src={post.featuredImage} alt={post.featuredImageAlt} loading="lazy"/></Link>}</div>
  <footer className="posts-note-footer"><ul role="list" className="posts-tags">{(post.tags.length?post.tags:post.categories).map(tag=><li key={tag.id}>{tag.name}</li>)}</ul><Link href={"/posts/"+post.slug} className="posts-view" aria-label={viewLabel+" "+post.title}>{viewLabel} →</Link></footer>
 </article>;
}
export function PostsExplorer({posts,section:s,available,initialFilter="all",categoryHeading}:{posts:WordPressArticle[];section:PostsSectionContent;available:boolean;initialFilter?:string;categoryHeading?:string}){
 const id=useId();
 const [filter,setFilter]=useState(initialFilter);
 const [query,setQuery]=useState("");
 const latest=latestArticles(posts);
 const latestIds=new Set(latest.map(p=>p.id));
 const categories=[...new Map(posts.flatMap(p=>p.categories).map(c=>[c.id,c])).values()];
 const visible=filterArticles(posts,filter,query,latestIds);
 const recent=visible.filter(p=>latestIds.has(p.id));
 const archived=visible.filter(p=>!latestIds.has(p.id));
 const average=posts.length?(posts.reduce((sum,p)=>sum+p.readingMinutes,0)/posts.length).toFixed(1):"0";
 return <div id="posts" className="posts posts-suite">
  <header id="posts-intro" className="posts-header"><div><div className="posts-header-labels"><p className="posts-label">{s.eyebrow}</p>{available&&<span className="posts-source"><i/>{s.source_label}</span>}</div><h1>{categoryHeading||s.heading} {!categoryHeading&&<span>{s.heading_accent}</span>}</h1><p className="posts-description">{s.description}</p></div><div className="posts-header-links"><Link href="/">← {s.back_label}</Link><a href="/posts/feed.xml">◔ {s.feed_label}</a></div></header>
  <div className="posts-metrics"><div><span aria-hidden>▤</span><p><small>{s.total_label}</small><strong>{posts.length} {posts.length===1?"post":"posts"}</strong></p></div><div><span aria-hidden>◷</span><p><small>{s.read_time_label}</small><strong>{average} min</strong></p></div><div><span aria-hidden>↯</span><p><small>{s.publishing_label}</small><strong>{s.publishing_value}</strong></p></div></div>
  <div className="posts-toolbar"><div className="posts-filters" role="group" aria-label="Filter articles"><button type="button" aria-pressed={filter==="all"} onClick={()=>setFilter("all")}>{s.all_label} ({posts.length})</button><button type="button" aria-pressed={filter==="latest"} onClick={()=>setFilter("latest")}>{s.latest_label} ({latest.length})</button>{categories.map(c=><button type="button" key={c.id} aria-pressed={filter==="category:"+c.slug} onClick={()=>setFilter("category:"+c.slug)}>{c.name} ({posts.filter(p=>p.categories.some(t=>t.id===c.id)).length})</button>)}</div><label className="posts-search"><span aria-hidden>⌕</span><input type="search" aria-label="Search articles" placeholder={s.search_placeholder} value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
  <p className="posts-result-count" aria-live="polite">{visible.length} {visible.length===1?"article":"articles"}</p>
  {!available?<div className="posts-empty"><h2>{s.error_heading}</h2><p>{s.error_description}</p></div>:!posts.length?<div className="posts-empty"><h2>{s.empty_heading}</h2><p>{s.empty_description}</p></div>:!visible.length?<p className="posts-empty">{s.no_results}</p>:null}
  {recent.length>0&&<section id="latest-posts" className="latest-posts posts-group" aria-labelledby={id + "-latest"}><div className="posts-group-heading"><h2 id={id + "-latest"}><span>{"// Posts"}</span>{s.latest_label}</h2><p>{String(recent.length).padStart(2,"0")} entries</p></div><div className="posts-recent-grid">{recent.map(p=><PostNoteCard key={p.id} post={p} viewLabel={s.view_label}/>)}</div></section>}
  {archived.length>0&&<section id="posts-archive" className="posts-archive posts-group" aria-labelledby={id + "-archive"}><div className="posts-group-heading"><h2 id={id + "-archive"}><span>{"// Archive"}</span>{s.archive_label}</h2><p>{String(archived.length).padStart(2,"0")} entries</p></div><div className="posts-archive-grid">{archived.map(p=><PostNoteCard key={p.id} post={p} viewLabel={s.view_label}/>)}</div></section>}
  {(s.principles||s.principles_heading)&&<section id="publishing-principles" className="publishing-principles posts-principles" aria-labelledby={id + "-principles"}><p className="posts-label">{s.principles_label}</p><h2 id={id + "-principles"}>{s.principles_heading}</h2><p>{s.principles_description}</p><div className="posts-principles-grid">{s.principles.split(/\r?\n/).filter(Boolean).map((line,i)=>{const [title,description,footer]=line.split("|");return <article className="publishing-principle" key={line}><span aria-hidden>{["↻","▦","◉"][i%3]}</span><h3>{title.trim()}</h3><p>{description?.trim()}</p>{footer&&<small>{"// "}{footer.trim()}</small>}</article>;})}</div></section>}
  <section id="posts-cta" className="posts-cta" aria-labelledby={id + "-cta"}><div><p className="posts-source"><i/>{s.cta_label}</p><h2 id={id + "-cta"}>{s.cta_heading}</h2><p>{s.cta_description}</p><div className="posts-cta-actions"><a href="/posts/feed.xml">{s.feed_button_label}</a>{s.contact_url&&<Link href={s.contact_url}>{s.contact_label} →</Link>}</div></div><span className="posts-terminal" aria-hidden>❯_</span></section>
 </div>;
}
