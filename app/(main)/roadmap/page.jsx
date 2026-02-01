import { getRoadmap } from "@/actions/roadmap";
import { getUserOnboardingStatus } from "@/actions/user";
import { getAchievementsData } from "@/actions/achievements";
import { redirect } from "next/navigation";
import RoadmapView from "./_components/roadmap-view";
import SeedAchievementsButton from "./_components/seed-achievements-button";

export default async function RoadmapPage() {
    const { isOnboarded } = await getUserOnboardingStatus();

    if (!isOnboarded) {
        redirect("/onboarding");
    }

    const [roadmap, achievementsResult] = await Promise.all([
        getRoadmap(),
        getAchievementsData(),
    ]);

    if (!roadmap) {
        redirect("/onboarding");
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl md:text-5xl font-bold gradient-title mb-8">
                Your Career Roadmap
            </h1>

            {/* Temporary: Seed Achievements Button */}
            <div className="mb-6">
                <SeedAchievementsButton />
            </div>

            <RoadmapView
                roadmap={roadmap}
                achievementData={achievementsResult.success ? achievementsResult.data : null}
            />
        </div>
    );
}
