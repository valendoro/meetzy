import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import InstallScript from "@/components/dashboard/InstallScript";
import SiteAnalyticsOverview from "@/components/dashboard/SiteAnalyticsOverview";
import SiteSubnav from "@/components/dashboard/SiteSubnav";

export const metadata = { title: "Detalle del sitio" };

export default async function SiteDetailPage({ params }: { params: Promise<{ siteId: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const { siteId } = await params;
  const site = await prisma.site.findFirst({
    where: { siteId, userId: dbUser.id },
    include: { _count: { select: { conversations: true } } },
  });
  if (!site) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.meetzy.ai";

  return (
    <div>
      <SiteSubnav siteId={siteId} siteName={site.name} active="overview" />

      <div className="mb-8">
        <SiteAnalyticsOverview
          siteId={site.siteId}
          siteName={site.name}
          siteUrl={site.url}
          appUrl={appUrl}
          initialIsActive={site.isActive}
        />
      </div>

      <InstallScript siteId={site.siteId} appUrl={appUrl} />
    </div>
  );
}
