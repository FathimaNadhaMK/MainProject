import { serve } from "inngest/next";

import { inngest } from "@/lib/inngest/client";
import { generateIndustryInsights } from "@/lib/inngest/function";
import { matchJobsForUsers } from "@/lib/inngest/match-jobs";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateIndustryInsights, matchJobsForUsers],
});
