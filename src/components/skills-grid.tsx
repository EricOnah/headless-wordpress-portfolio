import { getButtonLabels } from "@/lib/button-labels";
import { getSkillsData } from "@/lib/skills";
import { getProfessionalProfile } from "@/lib/professional-profile";
import { SkillsExplorer } from "@/components/skills-explorer";

export async function SkillsGrid() {
  const [data, profile] = await Promise.all([getSkillsData(), getProfessionalProfile()]);
  return <SkillsExplorer {...data} labels={await getButtonLabels("skills")} resumeUrl={profile.resume_url} />;
}
