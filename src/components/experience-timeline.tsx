import { getExperienceData } from "@/lib/experience";
import { getProfessionalProfile } from "@/lib/professional-profile";
import { ExperienceExplorer } from "@/components/experience-explorer";

export async function ExperienceTimeline() {
  const [data, profile] = await Promise.all([getExperienceData(), getProfessionalProfile()]);
  return <ExperienceExplorer {...data} resumeUrl={profile.resume_url} />;
}
