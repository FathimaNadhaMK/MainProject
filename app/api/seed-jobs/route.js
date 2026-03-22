import { NextResponse } from "next/server";
import { fetchAllJobs, generateSearchQueries } from "@/lib/job-matching/job-fetcher";
import { db } from "@/lib/prisma";

export const maxDuration = 60; // Allow 60 seconds

export async function GET(request) {
    try {
        console.log("Starting massive job fetch across 6 APIs...");
        const targetRoles = [
            "software-engineer", 
            "backend-developer", 
            "frontend-developer"
        ];

        let totalInserted = 0;

        for (const role of targetRoles) {
            console.log(`\n--- Fetching Jobs for ${role} ---`);
            const queries = await generateSearchQueries([role]);
            const jobs = await fetchAllJobs(queries);
            console.log(`Successfully fetched ${jobs.length} unique filtered jobs for ${role}`);

            if (jobs.length > 0) {
                const jobUpsertPromises = jobs.map(async (job) => {
                    try {
                        await db.jobListing.upsert({
                            where: { externalJobId: job.externalJobId },
                            update: { isActive: true, updatedAt: new Date() },
                            create: job,
                        });
                        return 1;
                    } catch (error) {
                        return 0; // Skip duplicates or errors
                    }
                });
                
                const results = await Promise.all(jobUpsertPromises);
                const inserted = results.reduce((a, b) => a + b, 0);
                totalInserted += inserted;
                console.log(`Upserted ${inserted} jobs into the database for ${role}.`);
            }
        }
        
        return NextResponse.json({ success: true, message: `✅ Finished! Successfully pushed ${totalInserted} active jobs into your database.` });
    } catch (error) {
        console.error("Seeding API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
