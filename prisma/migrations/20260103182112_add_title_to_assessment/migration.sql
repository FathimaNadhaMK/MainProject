/*
  Warnings:

  - You are about to drop the column `category` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `improvementTip` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `quizScore` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `User` table. All the data in the column will be lost.
  - The `skills` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `CoverLetter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IndustryInsight` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `title` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalQuestions` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileName` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileType` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileUrl` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_userId_fkey";

-- DropForeignKey
ALTER TABLE "CoverLetter" DROP CONSTRAINT "CoverLetter_userId_fkey";

-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_industry_fkey";

-- DropIndex
DROP INDEX "Resume_userId_key";

-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "category",
DROP COLUMN "improvementTip",
DROP COLUMN "quizScore",
DROP COLUMN "updatedAt",
ADD COLUMN     "certification" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "correctAnswers" JSONB,
ADD COLUMN     "explanations" JSONB,
ADD COLUMN     "recommendations" JSONB,
ADD COLUMN     "score" DOUBLE PRECISION,
ADD COLUMN     "timeTaken" INTEGER,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "totalQuestions" INTEGER NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "userAnswers" JSONB,
ADD COLUMN     "weakAreas" TEXT[];

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "content",
DROP COLUMN "feedback",
ADD COLUMN     "aiScore" DOUBLE PRECISION,
ADD COLUMN     "companyFeedback" JSONB,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "fileType" TEXT NOT NULL,
ADD COLUMN     "fileUrl" TEXT NOT NULL,
ADD COLUMN     "missingKeywords" TEXT[],
ADD COLUMN     "optimizationSuggestions" JSONB,
ADD COLUMN     "optimizedCompanyUrl" TEXT,
ADD COLUMN     "optimizedGeneralUrl" TEXT,
ADD COLUMN     "strengths" TEXT[],
ADD COLUMN     "weaknesses" TEXT[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bio",
DROP COLUMN "experience",
DROP COLUMN "industry",
ADD COLUMN     "background" TEXT,
ADD COLUMN     "certificationInterest" BOOLEAN DEFAULT false,
ADD COLUMN     "companySizePref" TEXT,
ADD COLUMN     "educationLevel" TEXT,
ADD COLUMN     "internshipInterest" TEXT[],
ADD COLUMN     "locationPref" TEXT,
ADD COLUMN     "targetCompanies" TEXT[],
ADD COLUMN     "targetRole" TEXT,
DROP COLUMN "skills",
ADD COLUMN     "skills" JSONB;

-- DropTable
DROP TABLE "CoverLetter";

-- DropTable
DROP TABLE "IndustryInsight";

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Personalized Career Roadmap',
    "skillGapAnalysis" JSONB,
    "weeklyPlan" JSONB[],
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "companyPrep" JSONB,
    "certificationRecs" TEXT[],
    "internshipTimeline" JSONB,
    "currentWeek" INTEGER NOT NULL DEFAULT 1,
    "completedWeeks" INTEGER[],
    "milestones" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastAIGenerated" TIMESTAMP(3),

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "company" TEXT,
    "role" TEXT,
    "difficulty" TEXT,
    "questions" JSONB[],
    "userResponses" JSONB,
    "idealAnswers" JSONB,
    "feedback" JSONB,
    "score" DOUBLE PRECISION,
    "areasToImprove" TEXT[],
    "duration" INTEGER,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "company" TEXT,
    "description" TEXT NOT NULL,
    "isGSoC" BOOLEAN NOT NULL DEFAULT false,
    "gsocOrg" TEXT,
    "gsocTimeline" JSONB,
    "isCertification" BOOLEAN NOT NULL DEFAULT false,
    "certProvider" TEXT,
    "examDate" TIMESTAMP(3),
    "cost" DOUBLE PRECISION,
    "eligibility" TEXT[],
    "skillsRequired" TEXT[],
    "applicationOpen" TIMESTAMP(3),
    "applicationClose" TIMESTAMP(3),
    "postedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applyLink" TEXT NOT NULL,
    "resources" TEXT[],
    "savedByCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedOpportunity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'interested',
    "appliedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCertification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "studyMaterials" TEXT[],
    "examDate" TIMESTAMP(3),
    "cost" DOUBLE PRECISION,
    "roiAnalysis" JSONB,
    "completionDate" TIMESTAMP(3),
    "certificateUrl" TEXT,
    "score" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "details" JSONB,
    "score" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressMilestone" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isAchieved" BOOLEAN NOT NULL DEFAULT false,
    "achievedAt" TIMESTAMP(3),
    "badge" TEXT,
    "xpReward" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetDate" TIMESTAMP(3),

    CONSTRAINT "ProgressMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "isNotified" BOOLEAN NOT NULL DEFAULT false,
    "applyLink" TEXT,
    "detailsLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "insights" JSONB,
    "recommendations" TEXT[],
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "isViewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "category" TEXT,
    "confidence" INTEGER DEFAULT 0,
    "lastPracticed" TIMESTAMP(3),
    "resourcesUsed" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roadmap_userId_key" ON "Roadmap"("userId");

-- CreateIndex
CREATE INDEX "Roadmap_userId_idx" ON "Roadmap"("userId");

-- CreateIndex
CREATE INDEX "Interview_userId_idx" ON "Interview"("userId");

-- CreateIndex
CREATE INDEX "Interview_type_idx" ON "Interview"("type");

-- CreateIndex
CREATE INDEX "Interview_company_idx" ON "Interview"("company");

-- CreateIndex
CREATE INDEX "Opportunity_type_idx" ON "Opportunity"("type");

-- CreateIndex
CREATE INDEX "Opportunity_company_idx" ON "Opportunity"("company");

-- CreateIndex
CREATE INDEX "Opportunity_applicationClose_idx" ON "Opportunity"("applicationClose");

-- CreateIndex
CREATE INDEX "Opportunity_isGSoC_idx" ON "Opportunity"("isGSoC");

-- CreateIndex
CREATE INDEX "Opportunity_isCertification_idx" ON "Opportunity"("isCertification");

-- CreateIndex
CREATE INDEX "SavedOpportunity_userId_status_idx" ON "SavedOpportunity"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SavedOpportunity_userId_opportunityId_key" ON "SavedOpportunity"("userId", "opportunityId");

-- CreateIndex
CREATE INDEX "UserCertification_userId_idx" ON "UserCertification"("userId");

-- CreateIndex
CREATE INDEX "UserCertification_provider_idx" ON "UserCertification"("provider");

-- CreateIndex
CREATE INDEX "UserCertification_status_idx" ON "UserCertification"("status");

-- CreateIndex
CREATE INDEX "UserActivity_userId_idx" ON "UserActivity"("userId");

-- CreateIndex
CREATE INDEX "UserActivity_activityType_idx" ON "UserActivity"("activityType");

-- CreateIndex
CREATE INDEX "UserActivity_createdAt_idx" ON "UserActivity"("createdAt");

-- CreateIndex
CREATE INDEX "UserActivity_userId_createdAt_idx" ON "UserActivity"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ProgressMilestone_userId_idx" ON "ProgressMilestone"("userId");

-- CreateIndex
CREATE INDEX "ProgressMilestone_type_idx" ON "ProgressMilestone"("type");

-- CreateIndex
CREATE INDEX "ProgressMilestone_isAchieved_idx" ON "ProgressMilestone"("isAchieved");

-- CreateIndex
CREATE INDEX "JobAlert_userId_idx" ON "JobAlert"("userId");

-- CreateIndex
CREATE INDEX "JobAlert_status_idx" ON "JobAlert"("status");

-- CreateIndex
CREATE INDEX "JobAlert_matchScore_idx" ON "JobAlert"("matchScore");

-- CreateIndex
CREATE INDEX "JobAlert_createdAt_idx" ON "JobAlert"("createdAt");

-- CreateIndex
CREATE INDEX "WeeklyInsight_userId_idx" ON "WeeklyInsight"("userId");

-- CreateIndex
CREATE INDEX "WeeklyInsight_createdAt_idx" ON "WeeklyInsight"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyInsight_userId_weekStart_key" ON "WeeklyInsight"("userId", "weekStart");

-- CreateIndex
CREATE INDEX "UserSkill_userId_idx" ON "UserSkill"("userId");

-- CreateIndex
CREATE INDEX "UserSkill_skill_idx" ON "UserSkill"("skill");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkill_userId_skill_key" ON "UserSkill"("userId", "skill");

-- CreateIndex
CREATE INDEX "Assessment_type_idx" ON "Assessment"("type");

-- CreateIndex
CREATE INDEX "Assessment_company_idx" ON "Assessment"("company");

-- CreateIndex
CREATE INDEX "Assessment_createdAt_idx" ON "Assessment"("createdAt");

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");

-- CreateIndex
CREATE INDEX "Resume_aiScore_idx" ON "Resume"("aiScore");

-- CreateIndex
CREATE INDEX "User_clerkUserId_idx" ON "User"("clerkUserId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_targetRole_idx" ON "User"("targetRole");

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedOpportunity" ADD CONSTRAINT "SavedOpportunity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedOpportunity" ADD CONSTRAINT "SavedOpportunity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCertification" ADD CONSTRAINT "UserCertification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressMilestone" ADD CONSTRAINT "ProgressMilestone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAlert" ADD CONSTRAINT "JobAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyInsight" ADD CONSTRAINT "WeeklyInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
