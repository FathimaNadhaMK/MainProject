"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InterviewHome() {
  const router = useRouter();

  // immediately redirect users to the new start page; the system check
  // component was deemed unnecessary, so we skip it entirely.
  useEffect(() => {
    router.replace("/interview/start");
  }, [router]);

  return null; // nothing to render, navigation happens on mount
}
