import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import SiteCard, { type SiteCardModel } from "@/components/dashboard/SiteCard";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const since24h = new Date(Date.now() - 86400000);
  const since7d = new Date(Date.now() - 7 * 86400000);
  const since30d = new Date(Date.now() - 30 * 86400000);

  const [userData, sites] = await Promise.all([
    prisma.user.findUnique({ where: { id: dbUser.id }, select: { plan: true } }),
    prisma.site.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { conversations: true } } },
    }),
  ]);

  const sitesWithMetrics: SiteCardModel[] = await Promise.all(
    sites.map(async (site) => {
      const [conversationsToday, conversationsWeek, conversationsMonth, intentGroups] = await Promise.all([
        prisma.conversation.count({
          where: { siteId: site.id, createdAt: { gte: since24h } },
        }),
        prisma.conversation.count({
          where: { siteId: site.id, createdAt: { gte: since7d } },
        }),
        prisma.conversation.count({
          where: { siteId: site.id, createdAt: { gte: since30d } },
        }),
        prisma.conversation.groupBy({
          by: ["intentLabel"],
          where: { siteId: site.id, createdAt: { gte: since7d } },
          _count: { _all: true },
        }),
      ]);

      return {
        id: site.id,
        siteId: site.siteId,
        name: site.name,
        url: site.url,
        plan: site.plan,
        isActive: site.isActive,
        agentName: site.agentName,
        brandColor: site.brandColor,
        avatarType: site.avatarType,
        conversationsToday,
        conversationsWeek,
        conversationsMonth,
        intentMix: intentGroups.map((g) => ({ intentLabel: g.intentLabel, count: g._count._all })),
        _count: site._count,
      };
    }),
  );

  return (
    <div>
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-syne text-2xl font-extrabold tracking-[-0.02em] text-[var(--text-primary)] md:text-3xl">
            Mis agentes
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Plan actual:{" "}
            <span className="font-syne font-semibold capitalize tracking-wide text-[var(--accent)]">
              {userData?.plan ?? "starter"}
            </span>
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/new">Crear nuevo agente</Link>
        </Button>
      </header>

      {sitesWithMetrics.length === 0 ? (
        <div className="product-empty-state relative flex flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
          <div
            className="relative z-[1] mb-6 flex size-20 items-center justify-center rounded-[var(--radius-lg)]"
            style={{
              background: "var(--accent-subtle)",
              border: "1px solid var(--accent-border)",
              boxShadow: "var(--shadow-accent)",
              color: "var(--accent)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v4" />
              <line x1="8" y1="16" x2="8" y2="16" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="16" y1="16" x2="16" y2="16" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="relative z-[1] font-syne text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Creá tu primer agente
          </h2>
          <p className="relative z-[1] mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
            Instalalo en tu web en minutos. Un asistente que entiende tu negocio y conversa con cada visitante.
          </p>
          <div className="relative z-[1] mt-8">
            <Button asChild size="lg">
              <Link href="/dashboard/new">Crear mi primer agente</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
          {sitesWithMetrics.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}
