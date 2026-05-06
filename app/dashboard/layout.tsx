import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  return (
    <div className="min-h-screen bg-[#07070a] flex flex-col">
      <DashboardNav
        user={{
          name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null,
          email: user?.emailAddresses[0]?.emailAddress ?? null,
          image: user?.imageUrl ?? null,
        }}
      />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
}
