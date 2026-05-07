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

  const [userData, sites, convWeekTotal, convAllTotal] = await Promise.all([
    prisma.user.findUnique({ where: { id: dbUser.id }, select: { plan: true } }),
    prisma.site.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { conversations: true } } },
    }),
    prisma.conversation.count({
      where: {
        site: { userId: dbUser.id },
        createdAt: { gte: since7d },
      },
    }),
    prisma.conversation.count({
      where: { site: { userId: dbUser.id } },
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

  const planUpper = (userData?.plan ?? "starter").toString().toUpperCase();

  return (
    <div>
      <header className="flex flex-col gap-6 border-b border-[rgba(255,255,255,0.04)] pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span
              className="inline-block size-1.5 shrink-0 rounded-full bg-[#22C55E]"
              style={{ boxShadow: "0 0 8px #22C55E" }}
              aria-hidden
            />
            <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
              Panel activo
            </span>
          </div>
          <h1 className="font-syne text-[28px] font-extrabold leading-tight tracking-[-1.5px] text-[var(--text-primary)]">
            Mis agentes
          </h1>
          <p className="mt-1 text-sm font-light text-[var(--text-secondary)]">
            Plan{" "}
            <span className="font-medium" style={{ color: "#6366f1" }}>
              {planUpper}
            </span>
          </p>
        </div>
        <CreateAgentLauncher
          size="lg"
          className="h-12 shrink-0 rounded-xl border-0 px-[18px] text-sm font-medium text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-150 hover:-translate-y-px sm:self-start"
          style={{ background: "#6366f1", fontFamily: "var(--font-dm-sans), DM Sans, sans-serif" }}
        >
          <span className="mr-1.5">＋</span>
          Nuevo agente
        </CreateAgentLauncher>
      </header>

      {sitesWithMetrics.length === 0 ? (
        <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-6 py-10 text-center">
          <div
            className="w-full max-w-[480px] rounded-[20px] px-8 py-10 text-center"
            style={{
              background: "#0C0C10",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
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
              className="mt-8 h-12 rounded-xl border-0 px-6 text-base font-medium text-white transition-all duration-150 hover:-translate-y-px"
              style={{ background: "#6366f1", boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}
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
        </div>
      ) : (
        <div className="pt-10">
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Resumen de cuenta">
            <div className="dash-home-stat rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-3">
              <p className="dash-home-stat-value tabular-nums">{sitesWithMetrics.length}</p>
              <p className="dash-home-stat-label">Agentes</p>
            </div>
            <div className="dash-home-stat rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-3">
              <p className="dash-home-stat-value tabular-nums">{convWeekTotal}</p>
              <p className="dash-home-stat-label">Chats · 7 días</p>
            </div>
            <div className="dash-home-stat rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-3">
              <p className="dash-home-stat-value tabular-nums">{convAllTotal}</p>
              <p className="dash-home-stat-label">Chats · total</p>
            </div>
            <div className="dash-home-stat rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-3">
              <p className="dash-home-stat-value font-syne text-base font-extrabold uppercase tracking-[0.12em] text-[var(--accent)] sm:text-lg">
                {planUpper}
              </p>
              <p className="dash-home-stat-label">Plan actual</p>
            </div>
          </div>
          <h2 className="mb-5 font-syne text-[1.125rem] font-bold tracking-[-0.02em] text-[var(--text-primary)]">
            Agentes activos
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {sitesWithMetrics.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
