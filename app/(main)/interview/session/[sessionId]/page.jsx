import InterviewRoom from "@/app/(main)/interview/components/InterviewRoom";

export default async function InterviewSessionPage({ params }) {
  console.log("Rendering InterviewSessionPage with params:", params);
  const { sessionId } = await params;
  console.log("Resolved sessionId:", sessionId);
  return <InterviewRoom sessionId={sessionId} />;
}
