import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export { auth };

/**
 * Get or create a Prisma user from the current Clerk session.
 * Returns null if not authenticated or Clerk is not configured.
 */
export async function getDbUser(): Promise<User | null> {
  // Bail early if Clerk keys aren't configured (dev without .env)
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    console.warn("[Meetzy] Clerk keys not set. Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to .env");
    return null;
  }

  try {
    const { userId } = await auth();
    if (!userId) return null;

    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || undefined;
    const image = clerkUser.imageUrl ?? undefined;

    const user = await prisma.user.upsert({
      where: { id: userId },
      update: { email, name: name ?? null, image: image ?? null },
      create: {
        id: userId,
        email,
        name: name ?? null,
        image: image ?? null,
        emailVerified: new Date(),
        plan: "starter",
      },
    });

    return user;
  } catch (error) {
    console.error("[Meetzy] getDbUser error:", error);
    return null;
  }
}

/**
 * Require auth — throws if not authenticated.
 */
export async function requireAuth() {
  const dbUser = await getDbUser();
  if (!dbUser) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return { dbUser };
}
