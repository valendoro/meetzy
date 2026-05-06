import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export { auth };

export async function getDbUser(): Promise<User | null> {
  if (!process.env.CLERK_SECRET_KEY) {
    console.warn("[auth] CLERK_SECRET_KEY not set");
    return null;
  }

  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? `${userId}@clerk.local`;
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;
  const image = clerkUser.imageUrl || null;

  // Try to find by Clerk userId first
  let user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    // If email exists with different id, just use that user
    const byEmail = await prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      // Return existing user as-is (don't change primary key)
      user = byEmail;
    } else {
      // Create fresh with Clerk userId as id
      user = await prisma.user.create({
        data: { id: userId, email, name: name ?? null, image: image ?? null, emailVerified: new Date(), plan: "starter" },
      });
    }
  } else {
    // Update name/image only
    user = await prisma.user.update({
      where: { id: userId },
      data: { name: name ?? null, image: image ?? null },
    });
  }

  return user;
}
