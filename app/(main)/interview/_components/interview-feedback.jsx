import StatsCards from "./stats-cards";
import PerformanceChart from "./performance-chart";

export default function InterviewFeedback({ responses }) {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">
        Interview Feedback
      </h2>

      <StatsCards />

      <PerformanceChart />

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Overall Review</h3>
        <p className="text-gray-700">
          You communicated your ideas clearly and showed good confidence.
          Technical explanations can be improved with more depth and examples.
        </p>
      </div>

      <div className="mt-4 text-green-600 font-medium">
        Verdict: Suitable for entry-level roles with practice.
      </div>
    </div>
  );
}
