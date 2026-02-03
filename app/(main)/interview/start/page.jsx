import InterviewEngine from "../_components/interview-engine";

export default function StartInterviewPage() {
  const resumeData = {
    skills: ["HTML", "CSS", "JavaScript", "Python"],
    projects: ["AI Interview Simulation"],
    education: "B.Tech CSE",
    level: "Fresher"
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        Interview in Progress
      </h1>

      <InterviewEngine resumeData={resumeData} />
    </div>
  );
}
