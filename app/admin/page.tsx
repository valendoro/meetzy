import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, format } from "date-fns";
import { es } from "date-fns/locale";
import { Users, Globe, MessageSquare, Mail, TrendingUp, Zap, DollarSign, Activity } from "lucide-react";
import Link from "next/link";

const PLAN_MRR: Record<string, number> = { starter: 29, pro: 79, elite: 199 };

export default async function AdminPage() {
  await requireAdmin();

  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sevenDaysAgo = subDays(now, 7);
  const todayStart = startOfDay(now);

  const [
    totalUsers,
    newUsersMonth,
    totalSites,
    activeSites,
    totalConversations,
    conversationsMonth,
    conversationsToday,
    emailsMonth,
    planCounts,
    recentUsers,
    recentConversations,
    dailyConvs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.site.count(),
    prisma.site.count({ where: { isActive: true } }),
    prisma.conversation.count(),
    prisma.conversation.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.conversation.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.conversation.count({ where: { createdAt: { gte: thirtyDaysAgo }, visitorEmail: { not: null } } }),
    prisma.user.groupBy({ by: ["plan"], _count: { id: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, email: true, name: true, plan: true, createdAt: true, isAdmin: true, _count: { select: { sites: true } } },
    }),
    prisma.conversation.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true, createdAt: true, intentLabel: true, intentScore: true,
        visitorEmail: true, country: true,
        site: { select: { name: true, siteId: true } },
      },
    }),
    prisma.$queryRaw<{ day: string; count: bigint }[]>`
      SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*) AS count
      FROM "Conversation"
      WHERE "createdAt" >= ${sevenDaysAgo}
      GROUP BY day ORDER BY day
    `,
  ]);

  // MRR estimate
  const mrr = planCounts.reduce((sum, row) => {
    return sum + (PLAN_MRR[row.plan] ?? 0) * row._count.id;
  }, 0);

  const planMap = Object.fromEntries(planCounts.map((r) => [r.plan, r._count.id]));

  const kpis = [
    { label: "Usuarios totales", value: totalUsers.toLocaleString("es-AR"), sub: `+${newUsersMonth} este mes`, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Sitios activos", value: activeSites.toLocaleString("es-AR"), sub: `${totalSites} en total`, icon: Globe, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Conversaciones / mes", value: conversationsMonth.toLocaleString("es-AR"), sub: `${conversationsToday} hoy`, icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Emails capturados", value: emailsMonth.toLocaleString("es-AR"), sub: "últimos 30 días", icon: Mail, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "MRR estimado", value: `$${mrr.toLocaleString("es-AR")}`, sub: "basado en planes activos", icon: DollarSign, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Total conversaciones", value: totalConversations.toLocaleString("es-AR"), sub: "histórico", icon: Activity, color: "text-pink-400", bg: "bg-pink-500/10" },
  ];

  const INTENT_COLOR: Record<string, string> = {
    hot_lead: "text-red-400 bg-red-500/12",
    ready_to_buy: "text-orange-400 bg-orange-500/12",
    evaluating: "text-yellow-400 bg-yellow-500/12",
    interested: "text-blue-400 bg-blue-500/12",
    exploring: "text-[var(--text-tertiary)] bg-[var(--bg-overlay)]",
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-syne text-[26px] font-extrabold tracking-[-1px] text-[var(--text-primary)]">
          Panel de administración
        </h1>
        <p className="mt-1 text-[13px] text-[var(--text-tertiary)]">
          Estadísticas en tiempo real de toda la plataforma Meetzy.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">{k.label}</p>
              <div className={`flex size-8 items-center justify-center rounded-lg ${k.bg}`}>
                <k.icon className={`size-4 ${k.color}`} />
              </div>
            </div>
            <p className="font-syne text-[28px] font-extrabold tracking-tight text-[var(--text-primary)]">{k.value}</p>
            <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Plan distribution */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="size-4 text-[var(--text-tertiary)]" />
          <h2 className="font-syne text-[14px] font-bold text-[var(--text-primary)]">Distribución de planes</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: "starter", label: "Starter", color: "bg-[var(--text-tertiary)]", text: "text-[var(--text-secondary)]" },
            { key: "pro", label: "Pro", color: "bg-[var(--accent)]", text: "text-[var(--accent)]" },
            { key: "elite", label: "Elite", color: "bg-amber-400", text: "text-amber-400" },
          ].map(({ key, label, color, text }) => {
            const count = planMap[key] ?? 0;
            const pct = totalUsers === 0 ? 0 : Math.round((count / totalUsers) * 100);
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[12px] font-semibold ${text}`}>{label}</span>
                  <span className="text-[12px] text-[var(--text-tertiary)]">{count} usuarios ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
                  <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent users */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-[var(--text-tertiary)]" />
              <h2 className="font-syne text-[13px] font-bold text-[var(--text-primary)]">Usuarios recientes</h2>
            </div>
            <Link href="/admin/users" className="text-[11px] text-[var(--accent)] hover:underline">Ver todos →</Link>
          </div>
          <ul className="divide-y divide-[var(--border-subtle)]">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-overlay)] transition-colors">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-subtle)] font-syne text-[11px] font-bold text-[var(--accent)]">
                  {(u.name ?? u.email)[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-[var(--text-primary)]">{u.email}</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">{u._count.sites} sitio{u._count.sites !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {u.isAdmin && <span className="rounded-full bg-red-500/12 px-1.5 py-0.5 text-[9px] font-bold text-red-400 uppercase">Admin</span>}
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${
                    u.plan === "elite" ? "border-amber-500/30 text-amber-400" :
                    u.plan === "pro" ? "border-[var(--accent-border)] text-[var(--accent)]" :
                    "border-[var(--border-default)] text-[var(--text-tertiary)]"
                  }`}>{u.plan}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">
                    {format(new Date(u.createdAt), "d MMM", { locale: es })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent conversations */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-[var(--text-tertiary)]" />
              <h2 className="font-syne text-[13px] font-bold text-[var(--text-primary)]">Conversaciones recientes</h2>
            </div>
            <Link href="/admin/conversations" className="text-[11px] text-[var(--accent)] hover:underline">Ver todas →</Link>
          </div>
          <ul className="divide-y divide-[var(--border-subtle)]">
            {recentConversations.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-overlay)] transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-[var(--text-primary)]">
                    {c.site?.name ?? "—"}
                  </p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">
                    {c.visitorEmail ?? "anónimo"} · {c.country ?? "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${INTENT_COLOR[c.intentLabel ?? "exploring"] ?? INTENT_COLOR.exploring}`}>
                    {c.intentLabel ?? "exploring"}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">
                    {format(new Date(c.createdAt), "d MMM HH:mm", { locale: es })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Activity last 7 days */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
        <h2 className="font-syne text-[13px] font-bold text-[var(--text-primary)] mb-4">Actividad últimos 7 días</h2>
        <div className="flex items-end gap-2 h-24">
          {dailyConvs.map((d) => {
            const max = Math.max(...dailyConvs.map((x) => Number(x.count)), 1);
            const pct = (Number(d.count) / max) * 100;
            return (
              <div key={String(d.day)} className="flex-1 flex flex-col items-center gap-1" title={`${format(new Date(d.day), "d MMM", { locale: es })}: ${d.count}`}>
                <div className="w-full rounded-t-sm bg-[var(--accent)] opacity-80 transition-all" style={{ height: `${pct}%`, minHeight: 4 }} />
                <span className="text-[9px] text-[var(--text-tertiary)]">{format(new Date(d.day), "d/M")}</span>
              </div>
            );
          })}
          {dailyConvs.length === 0 && (
            <p className="text-[12px] text-[var(--text-tertiary)]">Sin actividad aún.</p>
          )}
        </div>
      </div>
    </div>
  );
}
