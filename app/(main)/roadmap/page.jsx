import { getRoadmap } from "@/actions/roadmap";
import { getUserOnboardingStatus } from "@/actions/user";
import { getAchievementsData } from "@/actions/achievements";
import { redirect } from "next/navigation";
import RoadmapView from "./_components/roadmap-view";


export default async function RoadmapPage() {
    const onboardingStatus = await getUserOnboardingStatus();

    // If user is not authenticated, redirect to sign-in
    if (!onboardingStatus) {
        redirect("/sign-in");
    }

    const { isOnboarded } = onboardingStatus;

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



            <RoadmapView
                roadmap={roadmap}
                achievementData={achievementsResult.success ? achievementsResult.data : null}
            />
        </div>
    );
}
