import { getRoadmap } from "@/actions/roadmap";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import RoadmapView from "./_components/roadmap-view";

export default async function RoadmapPage() {
    const { isOnboarded } = await getUserOnboardingStatus();

    if (!isOnboarded) {
        redirect("/onboarding");
    }

    const roadmap = await getRoadmap();

    if (!roadmap) {
        redirect("/onboarding");
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl md:text-5xl font-bold gradient-title mb-8">
                Your Career Roadmap
            </h1>
            <RoadmapView roadmap={roadmap} />
        </div>
    );
}
