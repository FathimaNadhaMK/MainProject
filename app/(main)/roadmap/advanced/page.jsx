import { getRoadmap } from "@/actions/roadmap";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import PhaseView from "../_components/phase-view";

export default async function AdvancedPage() {
    const onboardingStatus = await getUserOnboardingStatus();

    // If user is not authenticated, redirect to sign-in
    if (!onboardingStatus) {
        redirect("/sign-in");
    }

    const { isOnboarded } = onboardingStatus;

    if (!isOnboarded) {
        redirect("/onboarding");
    }

    const roadmap = await getRoadmap();

    if (!roadmap) {
        redirect("/onboarding");
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <PhaseView
                roadmap={roadmap}
                phase="Advanced"
                weekRange={[9, 12]}
                phaseNumber={3}
            />
        </div>
    );
}
