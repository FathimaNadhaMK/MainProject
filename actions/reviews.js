"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";
import { checkUser } from "@/lib/checkUser";

export async function submitReview(data) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return { success: false, error: "You must be logged in to submit a review." };
        }

        const { rating, review } = data;

        const userRecord = await checkUser();

        if (userRecord) {
            const existingReview = await db.review.findUnique({
                where: { userId: userRecord.id }
            });

            if (existingReview) {
                await db.review.update({
                    where: { id: existingReview.id },
                    data: {
                        name: userRecord.name || "Platform User",
                        rating,
                        review
                    }
                });
                revalidatePath("/");
                return { success: true, message: "Review updated successfully!" };
            }
        }

        await db.review.create({
            data: {
                name: userRecord?.name || "Platform User",
                rating,
                review,
                userId: userRecord.id
            }
        });

        revalidatePath("/");
        return { success: true, message: "Review submitted successfully!" };
    } catch (error) {
        console.error("Failed to submit review:", error);
        return { success: false, error: "Failed to submit review." };
    }
}

export async function getUserReview() {
    try {
        const { userId } = await auth();
        if (!userId) return null;

        const userRecord = await checkUser();
        if (!userRecord) return null;

        const review = await db.review.findUnique({
            where: { userId: userRecord.id }
        });

        return review;
    } catch (error) {
        console.error("Failed to fetch user review:", error);
        return null;
    }
}

export async function getLatestReviews() {
    try {
        return await db.review.findMany({
            orderBy: { createdAt: "desc" },
            take: 3
        });
    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        return [];
    }
}
