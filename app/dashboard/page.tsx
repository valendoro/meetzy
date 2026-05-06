import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SiteCard from "@/components/dashboard/SiteCard";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [user, sites] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, name: true },
    }),
    prisma.site.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { conversations: true } },
      },
    }),
  ]);

  const recentCounts = await Promise.all(
    sites.map((site) =>
      prisma.conversation.count({
        where: {
          siteId: site.id,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      })
    )
  );

  const sitesWithMetrics = sites.map((site, i) => ({
    ...site,
    conversationsToday: recentCounts[i] ?? 0,
  }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne font-bold text-2xl text-[#F0EDE8]">
            Mis agentes
          </h1>
          <p className="text-sm text-[#6b6b6b] mt-1">
            Plan actual:{" "}
            <span className="text-accent capitalize font-medium">
              {user?.plan ?? "starter"}
            </span>
          </p>
        </div>

        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 bg-accent text-white font-medium px-4 py-2.5 rounded-xl hover:bg-accent/90 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          Nuevo agente
        </Link>
      </div>

      {/* Sites grid */}
      {sitesWithMetrics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-3xl mb-6">
            🤖
          </div>
          <h2 className="font-syne font-bold text-xl text-[#F0EDE8] mb-2">
            Creá tu primer agente
          </h2>
          <p className="text-[#6b6b6b] text-sm mb-8 max-w-sm">
            En 3 pasos tenés un agente AI con la identidad de tu marca
            instalado en tu web.
          </p>
          <Link
            href="/dashboard/new"
            className="bg-accent text-white font-medium px-6 py-3 rounded-xl hover:bg-accent/90 transition-colors"
          >
            Crear mi primer agente
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sitesWithMetrics.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}
