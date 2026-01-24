import { getResume } from "@/actions/resume";
import { getUserProfile } from "@/actions/user";
import ResumePageClient from "./resume-page-client";

export default async function ResumePage() {
    const [resume, userData] = await Promise.all([
        getResume(),
        getUserProfile().catch(() => null), // Handle case where user might not exist
    ]);

    return (
        <ResumePageClient
            initialContent={resume?.content}
            userData={userData}
        />
    );
}
