import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import InstallSnippet from "@/components/dashboard/InstallSnippet";
import SiteAnalyticsOverview from "@/components/dashboard/SiteAnalyticsOverview";
import SiteSubnav from "@/components/dashboard/SiteSubnav";
import { getAgentConfig } from "@/lib/agent-type-config";
import Link from "next/link";

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
  const agentCfg = getAgentConfig(site.agentType);

  return (
    <div>
      <SiteSubnav siteId={siteId} siteName={site.name} active="overview" />

      {/* Agent type banner */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{agentCfg.icon}</span>
          <div>
            <p className="font-syne text-[13px] font-bold text-[var(--text-primary)]">
              Agente · {agentCfg.label}
            </p>
            <p className="text-[12px] text-[var(--text-tertiary)]">{agentCfg.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {agentCfg.quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href(siteId)}
              className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-overlay)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--accent-border)] hover:text-[var(--accent)]"
            >
              <span>{action.icon}</span>
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <SiteAnalyticsOverview
          siteId={site.siteId}
          siteName={site.name}
          siteUrl={site.url}
          appUrl={appUrl}
          initialIsActive={site.isActive}
          brandColor={site.brandColor}
          agentType={site.agentType}
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
