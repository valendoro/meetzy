import { redirect } from "next/navigation";
import { getDbUser } from "@/lib/auth";
import type { User } from "@prisma/client";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminUser(user: User): boolean {
  if (user.isAdmin) return true;
  if (ADMIN_EMAILS.includes(user.email.toLowerCase())) return true;
  return false;
}

export async function requireAdmin(): Promise<User> {
  const user = await getDbUser();
  if (!user || !isAdminUser(user)) {
    redirect("/dashboard");
  }
  return user;
}
