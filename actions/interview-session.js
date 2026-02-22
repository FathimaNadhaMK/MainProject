"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { recruiters } from "@/lib/recruiters";
import { checkUser } from "@/lib/checkUser";

export async function createInterviewSession({ mode, recruiterId, recruiterProfile }) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  let user = await db.user.findUnique({
    where: { clerkUserId },
    include: {
      resume: true,
      roadmap: true,
    },
  });

  // if somehow we don't have the user, attempt to sync from Clerk (same
  // logic used elsewhere in the app). this handles edge cases where the
  // onboarding frontend may not have created the row yet or the DB was
  // reset after onboarding.
  if (!user) {
    await checkUser(); // may create or update the row
    user = await db.user.findUnique({
      where: { clerkUserId },
      include: { resume: true, roadmap: true },
    });
  }

  if (!user) {
    throw new Error(
      "User record not found. Please complete onboarding before starting an interview."
    );
  }

  let recruiter = null;
  if (recruiterProfile) {
    // client generated persona
    recruiter = recruiterProfile;
  } else if (recruiterId) {
    recruiter = recruiters[recruiterId];
  }
  if (!recruiter) throw new Error("Invalid recruiter");

  // derive personalization snapshot pieces
  const domain = (user.industry || "").toLowerCase().includes("tech")
    ? "technology"
    : (user.industry || "").toLowerCase().includes("bank")
    ? "banking"
    : "non-tech";

  const targetRole = user.targetRole || "General";

  // derive weak skills from the stored roadmap's skillGapAnalysis
  let weakSkills = [];
  if (user.roadmap?.skillGapAnalysis) {
    const analysis = user.roadmap.skillGapAnalysis;
    // assume analysis.gaps holds array of weak skill names
    if (analysis.gaps && Array.isArray(analysis.gaps)) {
      weakSkills = analysis.gaps;
    }
  }

  const pendingTopics = [];
  if (user.roadmap?.weeklyPlan && Array.isArray(user.roadmap.weeklyPlan)) {
    const completed = new Set(user.roadmap.completedWeeks || []);
    for (const w of user.roadmap.weeklyPlan) {
      if (!completed.has(w.week) && w.topic) {
        pendingTopics.push(w.topic);
      }
    }
  }

  const focusAreas = Array.from(
    new Set([...weakSkills, ...pendingTopics, ...(recruiter.focus || [])])
  );

  // extract resume content for interview context
  // fallback to user profile info if no resume content exists
  const resumeContent = user.resume?.content || `Name: ${user.name || "User"}
Industry: ${user.industry || "Not specified"}
Target Role: ${user.targetRole || "Not specified"}
Background: ${user.background || "Not provided"}`

  const interview = await db.interview.create({
    data: {
      userId: user.id,
      title: `${recruiter.name} Interview`,
      type: "AI",
      difficulty: recruiter.difficulty,
      isCompleted: false,

      // 🔑 Interview snapshot/config
      mode, // audio / video
      recruiterProfile: recruiter,
      resumeSnapshot: { content: resumeContent },
      focusAreas,
      config: {
        domain,
        targetRole,
        interviewMode: mode,
        recruiterPersona: recruiter.name,
        weakSkills,
        pendingTopics,
        careerGoal: targetRole,
      },

      // initialize orchestration state
      conversation: [],
      currentPhase: "Intro",
      currentDifficulty: "easy",
      turn: 1,
    },
  });

  return interview.id;
}

// return the stored session snapshot/config for a session
// includes domain, targets, persona, and other immutable fields
export async function fetchInterviewSession(sessionId) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const interview = await db.interview.findUnique({
    where: { id: sessionId },
    select: {
      mode: true,
      recruiterProfile: true,
      config: true,
      difficulty: true,
      focusAreas: true,
      resumeSnapshot: true,
    },
  });
  if (!interview) throw new Error("Interview not found");

  return interview;
}

// legacy alias for backward compatibility
export { fetchInterviewSession as fetchInterviewConfig };

// save a completed interview result (feedback already generated upstream)
export async function saveInterviewResult(sessionId, result) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const update = {
    feedback: result.feedback || null,
    score: result.overallScore != null ? result.overallScore : undefined,
    areasToImprove: result.areasToImprove || [],
    isCompleted: true,
  };

  const interview = await db.interview.update({
    where: { id: sessionId },
    data: update,
  });

  return interview;
}
