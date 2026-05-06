import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import SiteCard from "@/components/dashboard/SiteCard";

export const metadata = { title: "Dashboard" };

/** Plain props for the client `SiteCard` (only JSON-serializable fields). */
function siteCardProps(
  site: {
    id: string;
    siteId: string;
    name: string;
    url: string;
    plan: string;
    isActive: boolean;
    agentName: string;
    brandColor: string;
    avatarType: string | null;
    _count: { conversations: number };
  },
  conversationsToday: number
) {
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
    _count: site._count,
  };
}

export default async function DashboardPage() {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  // "Last 24h" cutoff — Server Component request scope (not a React client render).
  // eslint-disable-next-line react-hooks/purity -- Date bound to this HTTP request
  const since24h = new Date(Date.now() - 86400000);

  const [userData, sites] = await Promise.all([
    prisma.user.findUnique({ where: { id: dbUser.id }, select: { plan: true } }),
    prisma.site.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { conversations: true } } },
    }),
  ]);

  const recentCounts = await Promise.all(
    sites.map(site =>
      prisma.conversation.count({
        where: { siteId: site.id, createdAt: { gte: since24h } },
      })
    )
  );

  const sitesWithMetrics = sites.map((site, i) =>
    siteCardProps(site, recentCounts[i] ?? 0)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne font-bold text-2xl text-[#eceae5]">Mis agentes</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(236,234,229,0.4)" }}>
            Plan: <span className="text-accent capitalize font-medium">{userData?.plan ?? "starter"}</span>
          </p>
        </div>
        <Link href="/dashboard/new" className="btn-primary" style={{ textDecoration: "none" }}>
          + Nuevo agente
        </Link>
      </div>

      {sitesWithMetrics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-6"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
            🤖
          </div>
          <h2 className="font-syne font-bold text-xl text-[#eceae5] mb-2">Creá tu primer agente</h2>
          <p className="text-sm mb-8 max-w-sm" style={{ color: "rgba(236,234,229,0.4)" }}>
            En 3 pasos tenés un agente AI con la identidad de tu marca instalado en tu web.
          </p>
          <Link href="/dashboard/new" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex" }}>
            Crear mi primer agente
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sitesWithMetrics.map(site => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}
