import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

export const metadata = { title: "Conversaciones — Admin" };

const INTENT_COLOR: Record<string, string> = {
  hot_lead: "text-red-400 bg-red-500/12",
  ready_to_buy: "text-orange-400 bg-orange-500/12",
  evaluating: "text-yellow-400 bg-yellow-500/12",
  interested: "text-blue-400 bg-blue-500/12",
  exploring: "text-[var(--text-tertiary)] bg-[var(--bg-overlay)]",
};

export default async function AdminConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string; site?: string }>;
}) {
  await requireAdmin();
  const { intent, site } = await searchParams;

  const conversations = await prisma.conversation.findMany({
    where: {
      ...(intent ? { intentLabel: intent } : {}),
      ...(site ? { site: { siteId: site } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 80,
    select: {
      id: true,
      createdAt: true,
      intentLabel: true,
      intentScore: true,
      visitorEmail: true,
      visitorName: true,
      country: true,
      source: true,
      sessionDuration: true,
      site: { select: { name: true, siteId: true } },
      _count: { select: { messages: true } },
    },
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-syne text-[22px] font-extrabold tracking-[-0.5px] text-[var(--text-primary)]">
          Conversaciones
        </h1>
        <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">{conversations.length} más recientes</p>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 flex-wrap">
        <select name="intent" defaultValue={intent ?? ""} className="dash-input text-[13px] w-44">
          <option value="">Toda intención</option>
          <option value="hot_lead">Hot lead</option>
          <option value="ready_to_buy">Ready to buy</option>
          <option value="evaluating">Evaluating</option>
          <option value="interested">Interested</option>
          <option value="exploring">Exploring</option>
        </select>
        <button type="submit" className="btn-primary px-4 py-2 text-[12px]">Filtrar</button>
      </form>

      <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-overlay)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Sitio</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Visitante</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Intención</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Score</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Mensajes</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Origen</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {conversations.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--bg-overlay)] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--text-primary)] truncate max-w-[140px]">{c.site?.name ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[var(--text-secondary)] truncate max-w-[160px]">
                      {c.visitorName ?? c.visitorEmail ?? "Anónimo"}
                    </p>
                    {c.country && <p className="text-[10px] text-[var(--text-tertiary)]">{c.country}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${INTENT_COLOR[c.intentLabel ?? "exploring"] ?? INTENT_COLOR.exploring}`}>
                      {c.intentLabel ?? "exploring"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[var(--text-secondary)]">
                    {c.intentScore?.toFixed(0) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{c._count.messages}</td>
                  <td className="px-4 py-3 text-[var(--text-tertiary)] capitalize">{c.source ?? "direct"}</td>
                  <td className="px-4 py-3 text-[var(--text-tertiary)]">
                    {format(new Date(c.createdAt), "d MMM HH:mm", { locale: es })}
                  </td>
                  <td className="px-4 py-3">
                    {c.site && (
                      <Link
                        href={`/dashboard/${c.site.siteId}/conversations/${c.id}`}
                        className="text-[10px] text-[var(--accent)] hover:underline font-medium"
                      >
                        Ver →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {conversations.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-[12px] text-[var(--text-tertiary)]">
                    Sin conversaciones aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
