import { getUserProfile } from "@/actions/user";

export async function GET() {
  try {
    const result = await getUserProfile();
    return Response.json(result);
  } catch (err) {
    console.error("❌ User profile error:", err);
    return Response.json(
      { error: err.message || "Failed to get user profile" },
      { status: 500 }
    );
  }
}