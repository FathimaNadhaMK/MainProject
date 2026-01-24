import { generateAIInsights } from "@/actions/dashboard";

export async function generateSkillGap({ industry, skills }) {
  const ai = await generateAIInsights({ industry });

  const requiredSkills = ai?.trendingSkills || [];
  const gaps = requiredSkills.filter(
    (skill) => !skills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
  );

  return {
    industry,
    userSkills: skills,
    requiredSkills,
    missingSkills: gaps,
    emergingRoles: ai?.emergingRoles || [],
    certifications: ai?.certifications || [],
    riskLevel:
      gaps.length >= 6 ? "High" : gaps.length >= 3 ? "Medium" : "Low",
    summary: `You are missing ${gaps.length} key skills for ${industry}`,
  };
}
