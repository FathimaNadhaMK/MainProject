"use client";
import { useRouter } from "next/navigation";
import SystemCheck from "./_components/system-check";

export default function InterviewHome() {
  const router = useRouter();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        AI Interview – System Check
      </h1>

      <SystemCheck
        onSuccess={() => router.push("/interview/start")}
      />
    </div>
  );
}
