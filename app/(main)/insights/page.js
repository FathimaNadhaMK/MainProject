import { generateCareerInsights } from "@/actions/career-insights";

export default async function CareerInsightsPage() {
  const userId = "test-user"; // temporary, will be replaced later

  const insights = await generateCareerInsights(userId);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Career Insights</h1>

      <section>
        <h2 className="text-lg font-semibold">Weekly Summary</h2>
        <p className="mt-2 text-muted-foreground">{insights.summary}</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Recommendations</h2>
        <ul className="mt-2 list-disc pl-6">
          {insights.recommendations.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Next 7-Day Focus Plan</h2>
        <ul className="mt-2 list-disc pl-6">
          {insights.next7DayPlan.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Motivation</h2>
        <p className="mt-2 italic text-muted-foreground">
          {insights.motivation}
        </p>
      </section>
    </div>
  );
}
