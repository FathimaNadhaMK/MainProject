import { generateSkillGap } from "@/actions/skillGap";

export async function POST() {
  try {
    const skillGap = await generateSkillGap();
    return Response.json({ skillGap });
  } catch (err) {
    console.error("❌ Skill gap error:", err);
    return Response.json(
      { error: err.message || "Skill gap generation failed" },
      { status: 500 }
    );
  }
}
