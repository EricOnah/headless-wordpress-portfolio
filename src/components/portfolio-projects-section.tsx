
import { getPortfolioProjectsData } from "@/lib/portfolio-projects";
import { getProfessionalProfile } from "@/lib/professional-profile";
import { PortfolioProjectsExplorer } from "./portfolio-projects-explorer";
import "./portfolio-projects.css";
export async function PortfolioProjectsSection({featuredOnly=false}:{featuredOnly?:boolean}) {
 const [data,profile]=await Promise.all([getPortfolioProjectsData(),getProfessionalProfile()]);
 return <PortfolioProjectsExplorer projects={featuredOnly?data.projects.filter(p=>p.featured):data.projects} section={data.section} featuredOnly={featuredOnly} resumeUrl={profile.resume_url}/>;
}
