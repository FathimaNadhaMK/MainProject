
import { db } from "./lib/prisma.js";

async function checkTable() {
    try {
        const count = await db.review.count();
        console.log("Review count:", count);
        console.log("Table 'Review' exists!");
    } catch (error) {
        console.error("Error checking table:", error.message);
    } finally {
        process.exit();
    }
}

checkTable();
