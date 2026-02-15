import { getUserOnboardingStatus } from "@/actions/user";
import { getMatchedJobs, getJobMatchStats } from "@/actions/jobs";
import { redirect } from "next/navigation";
import JobsPageClient from "./_components/jobs-page-client";

export const metadata = {
    title: "Job Matches | Guidely",
    description: "AI-powered job matches personalized to your career profile",
};

export default async function JobsPage() {
    const onboardingStatus = await getUserOnboardingStatus();

    if (!onboardingStatus) {
        redirect("/sign-in");
    }

    const { isOnboarded } = onboardingStatus;
    if (!isOnboarded) {
        redirect("/onboarding");
    }

    let matchesResult = { success: false, data: { all: [], tiered: {}, total: 0, stats: {} } };
    let statsResult = { success: false, data: {} };

    try {
        [matchesResult, statsResult] = await Promise.all([
            getMatchedJobs(),
            getJobMatchStats(),
        ]);
    } catch (error) {
        console.error("Failed to load job matches:", error);
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <JobsPageClient
                matchesData={matchesResult.success ? matchesResult.data : null}
                stats={statsResult.success ? statsResult.data : null}
            />
        </div>
    );
}
