import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

/**
 * Get Clerk auth (server-side) — replacement for NextAuth's auth()
 */
export { auth };

/**
 * Get or create a Prisma user from the current Clerk session.
 * Call this in any server action / API route that needs the DB user.
 */
export async function getDbUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || undefined;
  const image = clerkUser.imageUrl ?? undefined;

  // Upsert by clerkId (stored in User.id field)
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: { email, name, image },
    create: {
      id: userId,
      email,
      name,
      image,
      emailVerified: new Date(),
      plan: "starter",
    },
  });

  return user;
}

/**
 * Require auth in an API route — returns { userId, dbUser } or throws 401.
 * Usage: const { userId, dbUser } = await requireAuth()
 */
export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const dbUser = await getDbUser();
  if (!dbUser) {
    throw new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }
  return { userId, dbUser };
}
