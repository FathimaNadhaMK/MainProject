// lib/inngest/preload-roadmap.js
import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { resourceFetcher } from "@/lib/resource-fetcher";

export const preloadRoadmap = inngest.createFunction(
  { id: "preload-roadmap", name: "Preload roadmap resources" },
  { cron: "0 2 * * *" },         // nightly
  async ({ step }) => {
    const users = await step.run("get-onboarded-users", () =>
      db.user.findMany({ where: { roadmap: { isNot: null } }, select: { id: true } })
    );

    for (const u of users) {
      await step.run(`fetch-for-user-${u.id}`, async () => {
        const roadmap = await db.roadmap.findUnique({ where: { userId: u.id } });
        if (!roadmap?.weeklyPlan) return;
        for (const w of roadmap.weeklyPlan) {
          // whatever is slow – e.g. resolve video URLs, GitHub data, etc.
          await resourceFetcher.cacheResources(w.resources);
        }
      });
    }
    // optionally revalidate pages
  }
);