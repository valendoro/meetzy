import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import InstallSnippet from "@/components/dashboard/InstallSnippet";
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
          brandColor={site.brandColor}
        />
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
        <h2 className="mb-3 font-[family-name:var(--font-dm-sans)] text-[13px] font-medium text-[var(--text-primary)]">
          Instalación
        </h2>
        <InstallSnippet siteId={site.siteId} appUrl={appUrl} />
        <p className="mt-4 text-[12px] leading-relaxed text-[var(--text-tertiary)]">
          <a href={`/dashboard/${siteId}/install`} className="font-medium text-[var(--accent)] hover:underline">
            Ver guía completa y verificación en vivo →
          </a>
        </p>
      </div>
    </div>
  );
}
