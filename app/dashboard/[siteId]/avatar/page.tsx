import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import AvatarConfigurator from "@/components/dashboard/AvatarConfigurator";
import SiteSubnav from "@/components/dashboard/SiteSubnav";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Avatar" };

export default async function AvatarPage({ params }: { params: Promise<{ siteId: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const { siteId } = await params;
  const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
  if (!site) notFound();

  const isPro = dbUser.plan === "pro" || dbUser.plan === "elite";

  return (
    <div>
      <SiteSubnav siteId={siteId} siteName={site.name} active="avatar" pageTitle="Avatar" />

      {!isPro ? (
        <div className="flex min-h-[calc(100vh-260px)] flex-col items-center justify-center py-6">
          {/* Avatar previews */}
          <div className="mb-8 flex items-end gap-4">
            {[
              { emoji: "🍊", label: "Naranja", color: "#f97316" },
              { emoji: "🐶", label: "Perro", color: "#6366f1" },
              { emoji: "👤", label: "Humano", color: "#0ea5e9" },
            ].map((a) => (
              <div
                key={a.label}
                className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-5 py-4 shadow-[var(--shadow-md)]"
              >
                <div
                  className="flex size-16 items-center justify-center rounded-xl text-3xl"
                  style={{ background: `color-mix(in srgb, ${a.color} 15%, transparent)` }}
                >
                  {a.emoji}
                </div>
                <span className="text-[11px] font-medium text-[var(--text-tertiary)]">{a.label}</span>
              </div>
            ))}
          </div>

          {/* Lock card */}
          <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--accent-border)] bg-[var(--accent-subtle)] p-8 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[var(--accent)] shadow-[0_0_24px_rgba(99,102,241,0.35)]">
              <Lock className="size-5 text-white" aria-hidden />
            </div>
            <h3 className="font-syne text-xl font-bold tracking-tight text-[var(--text-primary)]">Avatar de marca en Plan Pro</h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
              Personajes 2D animados con tus colores y logo. El widget en Starter sigue funcionando con burbuja y texto.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["Personajes únicos", "Tu color de marca", "Logo incluido"].map((f) => (
                <span key={f} className="rounded-full border border-[var(--accent-border)] bg-[var(--bg-surface)] px-3 py-1 text-[11px] font-medium text-[var(--accent)]">
                  ✓ {f}
                </span>
              ))}
            </div>
            <Button asChild className="mt-7 gap-2 px-6">
              <Link href="/pricing">
                <Sparkles className="size-4" />
                Ver planes Pro y Elite
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <AvatarConfigurator site={site} />
      )}
    </div>
  );
}
