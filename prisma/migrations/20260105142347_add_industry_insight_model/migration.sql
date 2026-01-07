-- CreateTable
CREATE TABLE "IndustryInsight" (
    "id" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "marketSize" TEXT,
    "growthRate" DOUBLE PRECISION,
    "averageSalary" TEXT,
    "trendingSkills" TEXT[],
    "emergingRoles" TEXT[],
    "topCompanies" TEXT[],
    "certifications" TEXT[],
    "learningResources" TEXT[],
    "challenges" TEXT[],
    "opportunities" TEXT[],
    "aiInsights" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextUpdate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndustryInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IndustryInsight_industry_key" ON "IndustryInsight"("industry");

-- CreateIndex
CREATE INDEX "IndustryInsight_industry_idx" ON "IndustryInsight"("industry");
