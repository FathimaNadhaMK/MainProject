import InterviewRoom from "@/app/(main)/interview/components/InterviewRoom";

export default function InterviewSessionPage({ params }) {
  const { sessionId } = params;
  return <InterviewRoom sessionId={sessionId} />;
}
