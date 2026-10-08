
export const defaultContactContent = {
  "page_label": "Contact",
  "heading": "Let’s build your next WordPress or headless experience",
  "introduction": "Whether you need a secure WordPress site, a custom plugin, or a headless React/Next.js front-end, I can help scope, ship, and optimize it.",
  "direct_lines_label": "Direct lines",
  "email_label": "Email",
  "email": "ericdavid4u@gmail.com",
  "phone_label": "Phone / WhatsApp",
  "phone": "+2348108769293",
  "whatsapp_url": "https://wa.link/eptfzc",
  "whatsapp_label": "Chat on WhatsApp (opens in a new tab)",
  "linkedin_label": "LinkedIn",
  "linkedin_action": "Connect",
  "linkedin_url": "https://linkedin.com/in/eric-onah/",
  "github_label": "GitHub",
  "github_action": "View code",
  "github_url": "https://github.com/EricOnah",
  "focus_heading": "Projects I focus on:",
  "focus_items": "Custom WordPress themes & plugins\nHeadless WordPress with Next.js or React\nAPI integrations, payments, and workflows\nPerformance, security, and SEO improvements"
};
export type ContactPageContent = typeof defaultContactContent;
export async function getContactPageContent():Promise<ContactPageContent>{
 const base=(process.env.WORDPRESS_API_URL||process.env.NEXT_PUBLIC_WORDPRESS_API_URL||"").replace(/\/$/,"").replace(/\/wp-json$/,"");
 if(!base) return defaultContactContent;
 try{
  const response=await fetch(base+"/?rest_route=/wp/v2/contact-pages&status=publish&orderby=modified&order=desc&per_page=1",{cache:"no-store",signal:AbortSignal.timeout(5000)});
  if(!response.ok) throw new Error("Contact page request failed: "+response.status);
  const entries:Array<{contact_data?:Partial<ContactPageContent>}>=await response.json();
  const fields=entries[0]?.contact_data;
  if(!fields) return defaultContactContent;
  const content={...defaultContactContent};
  for(const key of Object.keys(content) as Array<keyof ContactPageContent>){
   if(typeof fields[key]==="string") content[key]=fields[key];
  }
  for(const key of ["whatsapp_url","linkedin_url","github_url"] as const){
   if(!/^https?:\/\//i.test(content[key])) content[key]="";
  }
  return content;
 }catch(error){console.error("Unable to load Contact page content",error);return defaultContactContent;}
}
