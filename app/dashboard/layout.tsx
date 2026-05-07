import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getDbUser } from "@/lib/auth";
import DashboardChrome from "@/components/dashboard/DashboardChrome";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isGuestOnboarding = pathname === "/dashboard/new" || pathname.startsWith("/dashboard/new/");

  if (!isGuestOnboarding) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");
  }

  const dbUser = isGuestOnboarding ? null : await getDbUser();
  const plan = dbUser?.plan ?? "starter";
  const email = dbUser?.email ?? "";
  const displayName = dbUser?.name ?? "";

  return (
    <div className="meetzy-product-ui min-h-screen">
      <DashboardChrome plan={plan} displayName={displayName} email={email}>
        {children}
      </DashboardChrome>
    </div>
  );
}
