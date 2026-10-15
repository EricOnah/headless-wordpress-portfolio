
import { getButtonLabels } from "@/lib/button-labels";
import Link from "next/link";
import { PortfolioProjectsSection } from "@/components/portfolio-projects-section";
export default async function ProjectsPage(){
 const labels = await getButtonLabels("projects");
 return <main id="main-content" tabIndex={-1} className="projects-page mx-auto max-w-6xl px-6 py-10"><Link href="/" className="mb-6 inline-block text-sm text-emerald-200">← {labels.back_home_label}</Link><PortfolioProjectsSection/></main>;
}
