import { getResume } from "@/actions/resume";
import { getUserProfile } from "@/actions/user";
import CoverLetterClient from "./cover-letter-client";

export default async function CoverLetterPage() {

  const [resume, userData] = await Promise.all([
    getResume(),
    getUserProfile().catch(() => null),
  ]);

  return (
    <CoverLetterClient
      resumeContent={resume?.content}
      userData={userData}
    />
  );
}