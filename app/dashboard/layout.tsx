import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="dashboard-app min-h-screen bg-bg flex flex-col text-[color:var(--c-text)]">
      <DashboardNav />
      <main className="dash-main">{children}</main>
    </div>
  );
}
