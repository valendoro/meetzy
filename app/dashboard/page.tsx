import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import SiteCard, { type SiteCardModel } from "@/components/dashboard/SiteCard";
import { CreateAgentLauncher } from "@/components/dashboard/CreateAgentLauncher";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const since24h = new Date(Date.now() - 86400000);
  const since7d = new Date(Date.now() - 7 * 86400000);
  const since30d = new Date(Date.now() - 30 * 86400000);

  // 1 query: get sites
  const [userData, sites] = await Promise.all([
    prisma.user.findUnique({ where: { id: dbUser.id }, select: { plan: true } }),
    prisma.site.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { conversations: true } } },
    }),
  ]);

  const internalSiteIds = sites.map((s) => s.id);

  // 5 aggregate queries instead of 4N — constant cost regardless of site count
  const [convWeekTotal, convAllTotal, todayCounts, weekCounts, monthCounts, intentGroups] =
    internalSiteIds.length === 0
      ? [0, 0, [], [], [], []]
      : await Promise.all([
          prisma.conversation.count({
            where: { siteId: { in: internalSiteIds }, createdAt: { gte: since7d } },
          }),
          prisma.conversation.count({
            where: { siteId: { in: internalSiteIds } },
          }),
          prisma.conversation.groupBy({
            by: ["siteId"],
            where: { siteId: { in: internalSiteIds }, createdAt: { gte: since24h } },
            _count: { _all: true },
          }),
          prisma.conversation.groupBy({
            by: ["siteId"],
            where: { siteId: { in: internalSiteIds }, createdAt: { gte: since7d } },
            _count: { _all: true },
          }),
          prisma.conversation.groupBy({
            by: ["siteId"],
            where: { siteId: { in: internalSiteIds }, createdAt: { gte: since30d } },
            _count: { _all: true },
          }),
          prisma.conversation.groupBy({
            by: ["siteId", "intentLabel"],
            where: { siteId: { in: internalSiteIds }, createdAt: { gte: since7d } },
            _count: { _all: true },
          }),
        ]);

  // Build lookup maps for O(1) access
  const todayMap = new Map((todayCounts as { siteId: string; _count: { _all: number } }[]).map((r) => [r.siteId, r._count._all]));
  const weekMap = new Map((weekCounts as { siteId: string; _count: { _all: number } }[]).map((r) => [r.siteId, r._count._all]));
  const monthMap = new Map((monthCounts as { siteId: string; _count: { _all: number } }[]).map((r) => [r.siteId, r._count._all]));
  const intentMap = new Map<string, { intentLabel: string; count: number }[]>();
  for (const row of intentGroups as { siteId: string; intentLabel: string; _count: { _all: number } }[]) {
    if (!intentMap.has(row.siteId)) intentMap.set(row.siteId, []);
    intentMap.get(row.siteId)!.push({ intentLabel: row.intentLabel, count: row._count._all });
  }

  const sitesWithMetrics: SiteCardModel[] = sites.map((site) => ({
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
    conversationsToday: todayMap.get(site.id) ?? 0,
    conversationsWeek: weekMap.get(site.id) ?? 0,
    conversationsMonth: monthMap.get(site.id) ?? 0,
    intentMix: intentMap.get(site.id) ?? [],
    _count: site._count,
  }));

  const planUpper = (userData?.plan ?? "starter").toString().toUpperCase();
  const activeCount = sitesWithMetrics.filter((s) => s.isActive).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-10 flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-syne text-[26px] font-extrabold leading-tight tracking-[-1.5px] text-[var(--text-primary)]">
            Mis agentes
          </h1>
          <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-[13px] font-light text-[var(--text-tertiary)]">
            {sitesWithMetrics.length === 0
              ? "Sin agentes aún"
              : `${activeCount} agente${activeCount !== 1 ? "s" : ""} activo${activeCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        <CreateAgentLauncher
          size="sm"
          className="h-9 shrink-0 rounded-[var(--radius-md)] border-0 px-4 text-[13px] font-medium text-white shadow-[0_0_16px_rgba(99,102,241,0.2)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] sm:self-start"
          style={{ background: "#6366f1", fontFamily: "var(--font-dm-sans), DM Sans, sans-serif" }}
        >
          + Nuevo agente
        </CreateAgentLauncher>
      </div>

      {sitesWithMetrics.length === 0 ? (
        /* Empty state */
        <div className="flex min-h-[calc(100vh-240px)] flex-col items-center justify-center px-6 py-10 text-center">
          <div
            className="w-full max-w-[420px] rounded-[var(--radius-xl)] px-8 py-10 text-center"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="relative mb-10 flex h-36 w-full max-w-[320px] items-center justify-center mx-auto">
              <div className="dash-empty-float-1 absolute left-0 top-2 w-[30%] max-w-[100px] rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 shadow-[var(--shadow-md)]">
                <div className="mx-auto flex size-12 items-center justify-center rounded-[var(--radius-sm)] bg-[#3b82f6]/20 text-2xl">👔</div>
                <p className="mt-2 font-mono text-[10px] text-[var(--text-tertiary)]">Humano</p>
              </div>
              <div className="dash-empty-float-2 absolute right-2 top-0 w-[30%] max-w-[100px] rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 shadow-[var(--shadow-md)]">
                <div className="mx-auto flex size-12 items-center justify-center rounded-[var(--radius-sm)] bg-[#f97316]/25 text-2xl">🍊</div>
                <p className="mt-2 font-mono text-[10px] text-[var(--text-tertiary)]">Marca</p>
              </div>
              <div className="dash-empty-float-3 absolute bottom-0 left-1/3 w-[30%] max-w-[100px] rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 shadow-[var(--shadow-md)]">
                <div className="mx-auto flex size-12 items-center justify-center rounded-[var(--radius-sm)] bg-[#22c55e]/20 text-2xl">🐶</div>
                <p className="mt-2 font-mono text-[10px] text-[var(--text-tertiary)]">Mascota</p>
              </div>
            </div>
            <h2 className="font-syne text-xl font-bold tracking-[-0.03em] text-[var(--text-primary)]">
              Tu primer agente te está esperando
            </h2>
            <p className="mt-3 font-[family-name:var(--font-dm-sans)] text-[13px] font-light leading-relaxed text-[var(--text-secondary)]">
              En 10 minutos tenés un agente con tu identidad que entiende tu negocio.
            </p>
            <CreateAgentLauncher
              size="lg"
              className="mt-7 h-10 rounded-[var(--radius-md)] border-0 px-6 text-[13px] font-medium text-white transition-all duration-150 hover:-translate-y-px"
              style={{ background: "#6366f1", boxShadow: "0 0 16px rgba(99,102,241,0.25)" }}
            >
              Crear mi primer agente →
            </CreateAgentLauncher>
            <div className="mt-8 flex w-full flex-wrap justify-center gap-4">
              {["Sin código", "Sin contratos", "10 min"].map((pill) => (
                <span
                  key={pill}
                  className="rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-overlay)] px-3 py-1 text-[11px] font-medium text-[var(--text-tertiary)]"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Stats rail */}
          <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="dash-home-stat">
              <p className="dash-home-stat-value">{sitesWithMetrics.length}</p>
              <p className="dash-home-stat-label">Agentes</p>
            </div>
            <div className="dash-home-stat">
              <p className="dash-home-stat-value">{convWeekTotal}</p>
              <p className="dash-home-stat-label">Chats · 7d</p>
            </div>
            <div className="dash-home-stat">
              <p className="dash-home-stat-value">{convAllTotal}</p>
              <p className="dash-home-stat-label">Total chats</p>
            </div>
            <div className="dash-home-stat" style={{ borderColor: "rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.06)" }}>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                {planUpper}
              </p>
              <p className="dash-home-stat-label">Plan actual</p>
              <a
                href="/pricing"
                className="mt-auto pt-2 text-[10px] font-medium text-[var(--accent)] opacity-70 transition-opacity hover:opacity-100"
              >
                Cambiar →
              </a>
            </div>
          </div>

          {/* Agents grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {sitesWithMetrics.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
            {/* Add agent CTA */}
            <CreateAgentLauncher
              variant="ghost"
              className="flex min-h-[180px] flex-col items-center justify-center gap-2.5 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] text-[var(--text-tertiary)] transition-all duration-150 hover:border-[var(--accent-border)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)]"
            >
              <div className="flex size-9 items-center justify-center rounded-full border border-dashed border-current">
                <Plus className="size-4" strokeWidth={2} />
              </div>
              <span className="text-xs font-medium">Nuevo agente</span>
            </CreateAgentLauncher>
          </div>
        </div>
      )}
    </div>
  );
}
