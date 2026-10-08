import { getSkillsData } from "@/lib/skills";
import { getProfessionalProfile } from "@/lib/professional-profile";
import { SkillsExplorer } from "@/components/skills-explorer";

export async function SkillsGrid() {
  const [data, profile] = await Promise.all([getSkillsData(), getProfessionalProfile()]);
  return <SkillsExplorer {...data} resumeUrl={profile.resume_url} />;
}
