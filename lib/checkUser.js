import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || "User";
    const email = user.emailAddresses[0].emailAddress;

    // First, check if user exists by clerkUserId
    let loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    // If user exists, update their info
    if (loggedInUser) {
      loggedInUser = await db.user.update({
        where: {
          clerkUserId: user.id,
        },
        data: {
          name,
          imageUrl: user.imageUrl,
        },
      });
    } else {
      // Check if a user with this email already exists
      const existingUserByEmail = await db.user.findUnique({
        where: {
          email,
        },
      });

      if (existingUserByEmail) {
        // Update the existing user's clerkUserId
        loggedInUser = await db.user.update({
          where: {
            email,
          },
          data: {
            clerkUserId: user.id,
            name,
            imageUrl: user.imageUrl,
          },
        });
      } else {
        // Create new user
        loggedInUser = await db.user.create({
          data: {
            clerkUserId: user.id,
            name,
            imageUrl: user.imageUrl,
            email,
          },
        });
      }
    }

    return loggedInUser;
  } catch (error) {
    console.error("❌ checkUser error:", error.message);
    return null;
  }
};