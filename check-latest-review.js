
import { db } from "./lib/prisma.js";

async function getLatest() {
    try {
        const latestReview = await db.review.findFirst({
            orderBy: { createdAt: "desc" },
        });

        if (latestReview) {
            console.log("LAST_REVIEW_START");
            console.log(JSON.stringify(latestReview, null, 2));
            console.log("LAST_REVIEW_END");
        } else {
            console.log("No reviews found in the database.");
        }
    } catch (error) {
        console.error("Error fetching latest review:", error.message);
    } finally {
        process.exit();
    }
}

getLatest();
