import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search } from "lucide-react";

export const metadata = { title: "Usuarios — Admin" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plan?: string }>;
}) {
  await requireAdmin();
  const { q, plan } = await searchParams;

  const users = await prisma.user.findMany({
    where: {
      ...(q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] } : {}),
      ...(plan ? { plan } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      isAdmin: true,
      isReseller: true,
      createdAt: true,
      stripeCustomerId: true,
      _count: { select: { sites: true } },
      subscription: { select: { status: true, currentPeriodEnd: true } },
    },
  });

  const PLAN_COLOR: Record<string, string> = {
    elite: "border-amber-500/30 text-amber-400",
    pro: "border-[var(--accent-border)] text-[var(--accent)]",
    starter: "border-[var(--border-default)] text-[var(--text-tertiary)]",
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold tracking-[-0.5px] text-[var(--text-primary)]">
            Usuarios
          </h1>
          <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">{users.length} usuarios encontrados</p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[var(--text-tertiary)]" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por email o nombre..."
            className="dash-input pl-8 w-full text-[13px]"
          />
        </div>
        <select name="plan" defaultValue={plan ?? ""} className="dash-input text-[13px] w-36">
          <option value="">Todos los planes</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="elite">Elite</option>
        </select>
        <button type="submit" className="btn-primary px-4 py-2 text-[12px]">Filtrar</button>
      </form>

      {/* Table */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-overlay)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Usuario</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Plan</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Sitios</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Suscripción</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Stripe</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--bg-overlay)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-subtle)] font-syne text-[10px] font-bold text-[var(--accent)]">
                        {(u.name ?? u.email)[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--text-primary)] truncate max-w-[200px]">{u.email}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)]">{u.name ?? "Sin nombre"}</p>
                      </div>
                      {u.isAdmin && <span className="rounded-full bg-red-500/12 px-1.5 py-0.5 text-[9px] font-bold text-red-400 uppercase shrink-0">Admin</span>}
                      {u.isReseller && <span className="rounded-full bg-orange-500/12 px-1.5 py-0.5 text-[9px] font-bold text-orange-400 uppercase shrink-0">Reseller</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${PLAN_COLOR[u.plan] ?? PLAN_COLOR.starter}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] font-medium">{u._count.sites}</td>
                  <td className="px-4 py-3">
                    {u.subscription ? (
                      <div>
                        <span className={`text-[10px] font-semibold ${u.subscription.status === "active" ? "text-emerald-400" : "text-[var(--text-tertiary)]"}`}>
                          {u.subscription.status}
                        </span>
                        <p className="text-[10px] text-[var(--text-tertiary)]">
                          hasta {format(new Date(u.subscription.currentPeriodEnd), "d MMM yy", { locale: es })}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[var(--text-tertiary)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.stripeCustomerId ? (
                      <a
                        href={`https://dashboard.stripe.com/customers/${u.stripeCustomerId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[var(--accent)] hover:underline font-mono"
                      >
                        {u.stripeCustomerId.slice(0, 14)}…
                      </a>
                    ) : (
                      <span className="text-[10px] text-[var(--text-tertiary)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-tertiary)]">
                    {format(new Date(u.createdAt), "d MMM yyyy", { locale: es })}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[12px] text-[var(--text-tertiary)]">
                    No se encontraron usuarios.
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
