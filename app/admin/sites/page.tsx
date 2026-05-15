import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const metadata = { title: "Sitios — Admin" };

export default async function AdminSitesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plan?: string; active?: string }>;
}) {
  await requireAdmin();
  const { q, plan, active } = await searchParams;

  const sites = await prisma.site.findMany({
    where: {
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { url: { contains: q, mode: "insensitive" } }] } : {}),
      ...(plan ? { plan } : {}),
      ...(active !== undefined && active !== "" ? { isActive: active === "true" } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      siteId: true,
      name: true,
      url: true,
      plan: true,
      isActive: true,
      agentName: true,
      avatarType: true,
      brandColor: true,
      createdAt: true,
      user: { select: { email: true } },
      _count: { select: { conversations: true } },
    },
  });

  const PLAN_COLOR: Record<string, string> = {
    elite: "border-amber-500/30 text-amber-400",
    pro: "border-[var(--accent-border)] text-[var(--accent)]",
    starter: "border-[var(--border-default)] text-[var(--text-tertiary)]",
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold tracking-[-0.5px] text-[var(--text-primary)]">Sitios</h1>
          <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">{sites.length} sitios encontrados</p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 flex-wrap">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar nombre o URL..."
          className="dash-input flex-1 min-w-48 text-[13px]"
        />
        <select name="plan" defaultValue={plan ?? ""} className="dash-input text-[13px] w-36">
          <option value="">Todos los planes</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="elite">Elite</option>
        </select>
        <select name="active" defaultValue={active ?? ""} className="dash-input text-[13px] w-36">
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <button type="submit" className="btn-primary px-4 py-2 text-[12px]">Filtrar</button>
      </form>

      {/* Table */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-overlay)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Sitio</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Dueño</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Plan</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Conversaciones</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Creado</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {sites.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--bg-overlay)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="size-7 shrink-0 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: s.brandColor }}
                      >
                        {s.agentName[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--text-primary)] truncate max-w-[180px]">{s.name}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)] truncate max-w-[180px]">{s.agentName} · {s.avatarType ?? "sin avatar"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[var(--text-secondary)] truncate max-w-[160px]">{s.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${PLAN_COLOR[s.plan] ?? PLAN_COLOR.starter}`}>
                      {s.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 text-[11px] font-medium ${s.isActive ? "text-emerald-400" : "text-[var(--text-tertiary)]"}`}>
                      <span className={`size-1.5 rounded-full ${s.isActive ? "bg-emerald-400" : "bg-[var(--text-tertiary)]"}`} />
                      {s.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] font-medium">
                    {s._count.conversations.toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-tertiary)]">
                    {format(new Date(s.createdAt), "d MMM yyyy", { locale: es })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/${s.siteId}`}
                        className="flex items-center gap-1 text-[10px] text-[var(--accent)] hover:underline font-medium"
                      >
                        Dashboard
                      </Link>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {sites.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[12px] text-[var(--text-tertiary)]">
                    No se encontraron sitios.
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
