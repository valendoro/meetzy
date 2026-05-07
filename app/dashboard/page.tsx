import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SiteCard, { type SiteCardModel } from "@/components/dashboard/SiteCard";
import { CreateAgentLauncher } from "@/components/dashboard/CreateAgentLauncher";

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
        avatarImageUrl: site.avatarImageUrl,
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
      <header className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-syne text-[28px] font-extrabold tracking-[-0.045em] text-[var(--text-primary)] md:text-[32px]">
            Mis agentes
          </h1>
          <p className="mt-2 max-w-xl text-[15px] font-light leading-relaxed text-[var(--text-secondary)]">
            Administrá tus agentes y monitoreá su actividad.
          </p>
          <p className="mt-4 text-xs text-[var(--text-tertiary)]">
            Plan{" "}
            <span className="font-medium text-[var(--accent)]">{userData?.plan ?? "starter"}</span>
          </p>
        </div>
        <CreateAgentLauncher
          size="lg"
          className="h-11 rounded-[10px] bg-[var(--accent)] px-5 font-medium text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:bg-[var(--accent-hover)]"
        >
          ＋ Crear nuevo agente
        </CreateAgentLauncher>
      </header>

      {sitesWithMetrics.length === 0 ? (
        <div className="mx-auto flex max-w-[440px] flex-col items-center px-4 py-12 text-center">
          <div className="relative mb-10 flex h-36 w-full max-w-[320px] items-center justify-center">
            <div className="dash-empty-float-1 absolute left-0 top-2 w-[30%] max-w-[100px] rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#3b82f6]/20 text-2xl">👔</div>
              <p className="mt-2 text-[10px] text-[var(--text-tertiary)]">Humano</p>
            </div>
            <div className="dash-empty-float-2 absolute right-2 top-0 w-[30%] max-w-[100px] rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#f97316]/25 text-2xl">🍊</div>
              <p className="mt-2 text-[10px] text-[var(--text-tertiary)]">Marca</p>
            </div>
            <div className="dash-empty-float-3 absolute bottom-0 left-1/3 w-[30%] max-w-[100px] rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#22c55e]/20 text-2xl">🐶</div>
              <p className="mt-2 text-[10px] text-[var(--text-tertiary)]">Mascota</p>
            </div>
          </div>
          <h2 className="font-syne text-xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-2xl">
            Tu primer agente te está esperando
          </h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-[var(--text-secondary)]">
            En 10 minutos tenés un agente con tu identidad que entiende tu negocio y conversa con cada visitante.
          </p>
          <CreateAgentLauncher
            size="lg"
            className="mt-8 h-12 rounded-[10px] bg-[var(--accent)] px-6 text-base font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            Crear mi primer agente →
          </CreateAgentLauncher>
          <div className="mt-10 flex w-full flex-wrap justify-center gap-6 text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            <span>Sin código</span>
            <span>·</span>
            <span>Sin contratos</span>
            <span>·</span>
            <span>Listo en 10 min</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sitesWithMetrics.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}
