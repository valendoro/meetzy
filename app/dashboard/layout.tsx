import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDbUser } from "@/lib/auth";
import DashboardChrome from "@/components/dashboard/DashboardChrome";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await getDbUser();
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
