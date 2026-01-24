import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import DevResetButton from "@/components/DevResetButton";

export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  // If not onboarded, redirect to onboarding page
  // Skip this check if already on the onboarding page
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-6xl font-bold gradient-title mb-6">Industry Insights</h1>

        <div className="space-y-4">
          <div className="flex">
            <DevResetButton />
          </div>
          <p className="text-sm text-gray-400">
            Last updated: {new Date(insights.lastUpdated).toLocaleDateString('en-GB')}
          </p>
        </div>
      </div>

      <DashboardView insights={insights} />
    </div>
  );
}
