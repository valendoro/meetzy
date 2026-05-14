import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Sparkles, CreditCard, Bot, Calendar } from "lucide-react";

export const metadata = { title: "Mi cuenta" };

const PLAN_CONFIG = {
  starter: { label: "Starter", color: "text-[var(--text-secondary)]", bg: "bg-[var(--bg-overlay)]", border: "border-[var(--border-default)]", limit: 1 },
  pro:     { label: "Pro",     color: "text-[var(--accent)]",          bg: "bg-[var(--accent-subtle)]", border: "border-[var(--accent-border)]", limit: 5 },
  elite:   { label: "Elite",   color: "text-amber-400",                bg: "bg-amber-500/08",           border: "border-amber-500/30",           limit: 20 },
} as const;

export default async function AccountPage() {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const [sites, subscription] = await Promise.all([
    prisma.site.findMany({
      where: { userId: dbUser.id },
      select: { id: true, name: true, url: true, siteId: true, isActive: true, agentType: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.subscription.findUnique({ where: { userId: dbUser.id } }),
  ]);

  const plan = dbUser.plan as keyof typeof PLAN_CONFIG;
  const planCfg = PLAN_CONFIG[plan] ?? PLAN_CONFIG.starter;

  return (
    <div className="mx-auto max-w-2xl py-2 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-syne text-[26px] font-extrabold tracking-[-1.5px] text-[var(--text-primary)]">
          Mi cuenta
        </h1>
        <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
          Información de tu plan y agentes activos.
        </p>
      </div>

      {/* Profile card */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 space-y-4">
        <div className="flex items-center gap-4">
          {dbUser.image ? (
            <img src={dbUser.image} alt="" className="size-14 rounded-full border border-[var(--border-subtle)] object-cover" />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-xl font-bold text-[var(--accent)]">
              {(dbUser.name ?? dbUser.email)[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-syne text-[17px] font-bold text-[var(--text-primary)]">
              {dbUser.name ?? "Usuario"}
            </p>
            <p className="text-[13px] text-[var(--text-secondary)]">{dbUser.email}</p>
          </div>
        </div>
      </div>

      {/* Plan card */}
      <div className={`rounded-[var(--radius-xl)] border ${planCfg.border} ${planCfg.bg} p-6`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">Plan actual</p>
            <p className={`mt-1 font-syne text-[28px] font-extrabold tracking-tight ${planCfg.color}`}>
              {planCfg.label}
            </p>
            {subscription && (
              <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">
                Renueva el{" "}
                {format(new Date(subscription.currentPeriodEnd), "d 'de' MMMM yyyy", { locale: es })}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${planCfg.border} ${planCfg.color}`}>
              {subscription?.status === "active" ? "Activo" : plan === "starter" ? "Gratis" : "Activo"}
            </span>
          </div>
        </div>

        {/* Usage */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
            <div className="flex items-center gap-2 mb-1">
              <Bot className="size-3.5 text-[var(--text-tertiary)]" />
              <p className="text-[11px] text-[var(--text-tertiary)]">Agentes</p>
            </div>
            <p className="font-syne text-[20px] font-bold text-[var(--text-primary)]">
              {sites.length}
              <span className="ml-1 text-[13px] font-normal text-[var(--text-tertiary)]">/ {planCfg.limit}</span>
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (sites.length / planCfg.limit) * 100)}%`,
                  background: "var(--accent)",
                }}
              />
            </div>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="size-3.5 text-[var(--text-tertiary)]" />
              <p className="text-[11px] text-[var(--text-tertiary)]">Miembro desde</p>
            </div>
            <p className="font-syne text-[15px] font-bold text-[var(--text-primary)]">
              {format(new Date(dbUser.createdAt), "MMM yyyy", { locale: es })}
            </p>
          </div>
        </div>

        {/* CTA */}
        {plan !== "elite" && (
          <Link
            href="/pricing"
            className="mt-5 flex items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Sparkles className="size-4" />
            {plan === "starter" ? "Pasate a Pro" : "Pasate a Elite"}
          </Link>
        )}
      </div>

      {/* Sites list */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <p className="font-syne text-[13px] font-bold text-[var(--text-primary)]">Tus agentes</p>
          <Link href="/dashboard" className="text-[11px] text-[var(--accent)] hover:underline">
            Ver todos →
          </Link>
        </div>
        {sites.length === 0 ? (
          <div className="px-5 py-8 text-center text-[13px] text-[var(--text-tertiary)]">
            No tenés agentes aún.{" "}
            <Link href="/dashboard/new" className="text-[var(--accent)] hover:underline">Crear uno →</Link>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {sites.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/dashboard/${s.siteId}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--bg-overlay)] transition-colors"
                >
                  <span className={`size-2 rounded-full shrink-0 ${s.isActive ? "bg-emerald-500" : "bg-[var(--text-tertiary)]"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">{s.name}</p>
                    <p className="truncate text-[11px] text-[var(--text-tertiary)]">{s.url}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-[var(--text-tertiary)]">
                    {format(new Date(s.createdAt), "d MMM yy", { locale: es })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Billing */}
      {subscription && (
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CreditCard className="size-4 text-[var(--text-tertiary)]" />
            <div>
              <p className="text-[13px] font-medium text-[var(--text-primary)]">Facturación</p>
              <p className="text-[11px] text-[var(--text-tertiary)]">Stripe · suscripción activa</p>
            </div>
          </div>
          <Link
            href="/api/stripe/checkout"
            className="text-[12px] font-medium text-[var(--accent)] hover:underline"
          >
            Gestionar →
          </Link>
        </div>
      )}
    </div>
  );
}
