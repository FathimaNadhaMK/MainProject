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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-title">
            Industry Insights
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered market analysis and career opportunities
          </p>
        </div>
        <DevResetButton />
      </div>

      <DashboardView insights={insights} />
    </div>
  );
}
