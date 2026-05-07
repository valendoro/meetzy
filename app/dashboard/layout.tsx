import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardChrome from "@/components/dashboard/DashboardChrome";
import { CreateAgentModalProvider } from "@/components/providers/create-agent-modal";
import { ProductToastProvider } from "@/components/providers/product-toast";

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

  const sites = dbUser
    ? await prisma.site.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: "desc" },
        select: { siteId: true, name: true, agentName: true },
      })
    : [];

  return (
    <div className="meetzy-product-ui min-h-screen">
      <ProductToastProvider>
        <CreateAgentModalProvider userPlan={plan} isGuest={isGuestOnboarding}>
          <DashboardChrome plan={plan} displayName={displayName} email={email} sites={sites}>
            {children}
          </DashboardChrome>
        </CreateAgentModalProvider>
      </ProductToastProvider>
    </div>
  );
}
