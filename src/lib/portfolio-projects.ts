import { secureWordPressMediaUrl } from "@/lib/wordpress-media";

export type PortfolioProject = {
 id:number; slug:string; title:string; category:string; badge:string; description:string;
 highlight:string; tags:string[]; url:string; featured:boolean; image_url:string; image_alt:string; accent:string;
};
export const defaultProjectsSection = {
  "eyebrow": "Work & case studies // selected projects",
  "heading": "Featured WordPress &",
  "heading_accent": "headless builds",
  "description": "Selected work across headless WordPress, commerce, corporate platforms, and community publishing. Built around structured content and responsive user experiences.",
  "all_label": "All projects",
  "archive_label": "Explore all projects",
  "view_label": "View",
  "principles_label": "// Core specifications",
  "principles_heading": "Architecture principles in every build",
  "principles": "Flexible content architecture | Structured content and custom fields make websites easier to maintain and evolve.\nPurpose-built interfaces | Responsive layouts and clear navigation connect people with the content and services they need.\nReliable development workflows | Maintainable code, version control, and careful troubleshooting support dependable delivery.",
  "cta_label": "Have a project in mind?",
  "cta_heading": "Let’s build your next WordPress or headless experience.",
  "cta_description": "From custom publishing platforms to complex commerce workflows, let’s plan the right solution for your business.",
  "contact_label": "Discuss a project",
  "contact_url": "/contact",
  "resume_label": "View technical resume"
};
export type ProjectsSectionContent = typeof defaultProjectsSection;
export const defaultPortfolioProjects:PortfolioProject[] = [
  {
    "id": 1,
    "slug": "omonoia-foundation",
    "title": "OMONOIA Foundation",
    "category": "Headless & Jamstack",
    "badge": "Headless WordPress",
    "description": "Built and maintained a headless WordPress platform with a React / Next.js frontend, WordPress content backend, and REST API content delivery.",
    "highlight": "Decoupled content delivery",
    "tags": [
      "WordPress",
      "React",
      "Next.js",
      "REST API"
    ],
    "url": "https://omonoiafoundation.com.cy/en",
    "featured": true,
    "image_url": "/projects/omonoia-foundation.png",
    "image_alt": "OMONOIA Foundation website preview",
    "accent": "emerald"
  },
  {
    "id": 2,
    "slug": "omonoia-e-shop",
    "title": "OMONOIA E-Shop",
    "category": "E-commerce",
    "badge": "WooCommerce",
    "description": "Developed and maintained a multilingual WooCommerce store with custom variation and shared-stock logic, payment and fulfilment rules, and responsive shopping experiences.",
    "highlight": "Custom variations & shared inventory",
    "tags": [
      "WooCommerce",
      "Multilingual",
      "Custom variations",
      "Payments"
    ],
    "url": "https://shop.omonoiafc.com.cy/en/shop/",
    "featured": true,
    "image_url": "/projects/omonoia-e-shop.png",
    "image_alt": "OMONOIA E-Shop website preview",
    "accent": "cyan"
  },
  {
    "id": 3,
    "slug": "gree-cyprus",
    "title": "GREE Cyprus",
    "category": "Corporate & Products",
    "badge": "WordPress",
    "description": "Built a bilingual English / Greek product platform with structured HVAC showcases, multilingual content, wishlist functionality, and custom Elementor interfaces.",
    "highlight": "Bilingual product discovery",
    "tags": [
      "WordPress",
      "Elementor",
      "Multilingual",
      "Product catalogue"
    ],
    "url": "https://greecyprus.com/",
    "featured": true,
    "image_url": "/projects/gree-cyprus.png",
    "image_alt": "GREE Cyprus website preview",
    "accent": "emerald"
  },
  {
    "id": 4,
    "slug": "gdm-architecture",
    "title": "GDM Architecture",
    "category": "Architecture & Real Estate",
    "badge": "WordPress",
    "description": "Created a premium architecture portfolio with custom post types, taxonomies, ACF project content, dynamic galleries, filtering, and responsive layouts.",
    "highlight": "Structured projects & dynamic galleries",
    "tags": [
      "WordPress",
      "ACF",
      "Custom post types",
      "Project filtering"
    ],
    "url": "https://gdmarchitecture.com/",
    "featured": true,
    "image_url": "/projects/gdm-architecture.png",
    "image_alt": "GDM Architecture website preview",
    "accent": "cyan"
  },
  {
    "id": 5,
    "slug": "servbank",
    "title": "Servbank",
    "category": "Corporate & Products",
    "badge": "Financial services",
    "description": "Contributed to a financial services platform covering banking, mortgage and loan servicing, customer resources, and lead generation.",
    "highlight": "Banking & customer resources",
    "tags": [
      "Financial services",
      "Mortgage servicing",
      "Lead generation"
    ],
    "url": "https://servbank.com/",
    "featured": true,
    "image_url": "",
    "image_alt": "Servbank website preview",
    "accent": "emerald"
  },
  {
    "id": 6,
    "slug": "officestar",
    "title": "OfficeStar",
    "category": "E-commerce",
    "badge": "B2B commerce",
    "description": "Developed and enhanced a large B2B commerce catalogue with complex categories, mega menus, product discovery, brand organisation, and responsive interfaces.",
    "highlight": "Large catalogue & product discovery",
    "tags": [
      "B2B",
      "E-commerce",
      "Product catalogue",
      "Responsive UI"
    ],
    "url": "https://officestar.com.cy/",
    "featured": true,
    "image_url": "",
    "image_alt": "OfficeStar website preview",
    "accent": "cyan"
  },
  {
    "id": 7,
    "slug": "ablebook",
    "title": "Ablebook",
    "category": "Community & Publishing",
    "badge": "Accessibility platform",
    "description": "Contributed to a multilingual accessibility and inclusion platform supporting employment, services, resources, news, and a wider community ecosystem.",
    "highlight": "Accessibility & multilingual publishing",
    "tags": [
      "WordPress",
      "Multilingual",
      "Accessibility",
      "Publishing"
    ],
    "url": "https://ablebook.com.cy/",
    "featured": true,
    "image_url": "",
    "image_alt": "Ablebook website preview",
    "accent": "emerald"
  },
  {
    "id": 8,
    "slug": "kriztech-agency",
    "title": "Kriztech Agency",
    "category": "Corporate & Products",
    "badge": "Agency",
    "description": "Agency website presenting digital services and a professional online presence.",
    "highlight": "Agency & service discovery",
    "tags": [
      "Agency",
      "Services"
    ],
    "url": "https://krisztech.com/",
    "featured": false,
    "image_url": "",
    "image_alt": "Kriztech Agency website preview",
    "accent": "cyan"
  },
  {
    "id": 9,
    "slug": "four-day-clearance",
    "title": "Four Day Clearance",
    "category": "E-commerce",
    "badge": "Online retail",
    "description": "Furniture and home essentials storefront with product categories, shopping deals, and online ordering.",
    "highlight": "Retail catalogue & shopping",
    "tags": [
      "E-commerce",
      "Product catalogue",
      "Online retail"
    ],
    "url": "https://fourdayclearance.cy/",
    "featured": false,
    "image_url": "",
    "image_alt": "Four Day Clearance website preview",
    "accent": "emerald"
  },
  {
    "id": 10,
    "slug": "omonoia-fc",
    "title": "OMONOIA FC",
    "category": "Sports",
    "badge": "Football club",
    "description": "Official football club website bringing together club information, news, and supporter resources.",
    "highlight": "Club news & supporter information",
    "tags": [
      "Sports",
      "News",
      "Publishing"
    ],
    "url": "https://www.omonoiafc.com.cy/",
    "featured": false,
    "image_url": "",
    "image_alt": "OMONOIA FC website preview",
    "accent": "cyan"
  },
  {
    "id": 11,
    "slug": "prosperity-group",
    "title": "Prosperity Group",
    "category": "Architecture & Real Estate",
    "badge": "Corporate platform",
    "description": "Corporate platform showcasing real estate developments, construction services, projects, and company news.",
    "highlight": "Projects & corporate publishing",
    "tags": [
      "Real estate",
      "Corporate",
      "Project portfolio"
    ],
    "url": "https://prosperitygrp.com/",
    "featured": false,
    "image_url": "",
    "image_alt": "Prosperity Group website preview",
    "accent": "emerald"
  },
  {
    "id": 12,
    "slug": "great-place-to-work-cyprus",
    "title": "Great Place to Work Cyprus",
    "category": "Community & Publishing",
    "badge": "Workplace culture",
    "description": "Regional platform presenting workplace culture services, certification programmes, company recognition, and resources.",
    "highlight": "Certification & workplace resources",
    "tags": [
      "Publishing",
      "Resources",
      "Workplace culture"
    ],
    "url": "https://www.greatplacetowork.com.cy/",
    "featured": false,
    "image_url": "",
    "image_alt": "Great Place to Work Cyprus website preview",
    "accent": "cyan"
  },
  {
    "id": 13,
    "slug": "great-place-to-work-jordan",
    "title": "Great Place to Work Jordan",
    "category": "Community & Publishing",
    "badge": "Workplace culture",
    "description": "Regional website for workplace culture programmes, employer certification, recognition, and research resources.",
    "highlight": "Regional content & recognition",
    "tags": [
      "Publishing",
      "Resources",
      "Workplace culture"
    ],
    "url": "https://greatplacetowork.jo/",
    "featured": false,
    "image_url": "",
    "image_alt": "Great Place to Work Jordan website preview",
    "accent": "emerald"
  },
  {
    "id": 14,
    "slug": "isk",
    "title": "ISK",
    "category": "Corporate & Products",
    "badge": "Corporate website",
    "description": "Corporate website for ISK in Cyprus.",
    "highlight": "Corporate web presence",
    "tags": [
      "Corporate"
    ],
    "url": "http://isk.com.cy/",
    "featured": false,
    "image_url": "",
    "image_alt": "ISK website preview",
    "accent": "cyan"
  }
];
type Entry={id:number;slug:string;project_data:Record<string,string>};
function safeUrl(value:string) {return /^\/(?!\/)/.test(value)||/^https?:\/\//i.test(value)?value:"";}
async function entries(base:string,route:string):Promise<Entry[]> {
 const all:Entry[]=[];
 for(let page=1;;page++) {
  const response=await fetch(base+"/?rest_route=/wp/v2/"+route+"&per_page=100&page="+page,{cache:"no-store",signal:AbortSignal.timeout(5000)});
  if(!response.ok) throw new Error("Projects request failed: "+response.status);
  all.push(...await response.json());
  if(page>=Number(response.headers.get("X-WP-TotalPages")||1)) return all;
 }
}
export async function getPortfolioProjectsData():Promise<{projects:PortfolioProject[];section:ProjectsSectionContent}> {
 const base=(process.env.WORDPRESS_API_URL||process.env.NEXT_PUBLIC_WORDPRESS_API_URL||"").replace(/\/$/,"").replace(/\/wp-json$/,"");
 if(!base) return {projects:defaultPortfolioProjects,section:defaultProjectsSection};
 try {
  const [projects,sections]=await Promise.all([entries(base,"portfolio-projects&orderby=menu_order&order=asc"),entries(base,"project-sections&orderby=modified&order=desc")]);
  const section={...defaultProjectsSection};
  const fields=sections[0]?.project_data;
  if(fields) for(const key of Object.keys(section) as Array<keyof ProjectsSectionContent>) {
   if(typeof fields[key]==="string") section[key]=fields[key];
  }
  section.contact_url=safeUrl(section.contact_url);
  return {section,projects:projects.map(({id,slug,project_data:d})=>({
   id,slug,title:d.title||"",category:d.category||"Other",badge:d.badge||"",description:d.description||"",highlight:d.highlight||"",
   tags:(d.tags||"").split(/\r?\n/).map(s=>s.trim()).filter(Boolean),url:safeUrl(d.url||""),featured:d.featured==="1",
   image_url:secureWordPressMediaUrl(safeUrl(d.image_url||"")),image_alt:d.image_alt||d.title||"",accent:d.accent==="cyan"?"cyan":"emerald"
  }))};
 }catch(error){console.error("Unable to load portfolio projects:",error);return {projects:defaultPortfolioProjects,section:defaultProjectsSection};}
}
