import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InstallSnippet from "@/components/dashboard/InstallSnippet";
import SiteSubnav from "@/components/dashboard/SiteSubnav";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Settings, MessageSquare, BarChart2, Palette, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Instalación" };

export default async function SiteInstallPage({ params }: { params: Promise<{ siteId: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const { siteId } = await params;
  const site = await prisma.site.findFirst({
    where: { siteId, userId: dbUser.id },
    select: { name: true, siteId: true },
  });
  if (!site) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.meetzy.ai";

  const nextSteps = [
    {
      icon: Settings,
      title: "Configurá tu agente",
      desc: "Ajustá el nombre, idioma, personalidad y contexto de negocio.",
      href: `/dashboard/${siteId}/settings`,
      color: "#6366f1",
    },
    {
      icon: Palette,
      title: "Personalizá el avatar",
      desc: "Elegí un personaje 2D con tus colores y logo de marca.",
      href: `/dashboard/${siteId}/avatar`,
      color: "#a855f7",
    },
    {
      icon: MessageSquare,
      title: "Revisá las conversaciones",
      desc: "Mirá en tiempo real qué le preguntan los visitantes a tu agente.",
      href: `/dashboard/${siteId}/conversations`,
      color: "#0ea5e9",
    },
    {
      icon: BarChart2,
      title: "Analizá el rendimiento",
      desc: "Métricas de intención, fuentes de tráfico y leads calificados.",
      href: `/dashboard/${siteId}/analytics`,
      color: "#22c55e",
    },
  ];

  const tips = [
    "El script no afecta la velocidad de carga de tu web — se carga de forma asincrónica.",
    "Podés instalar el widget en múltiples páginas; el agente siempre reconoce la URL activa.",
    "Si usás un SPA (React, Vue), el widget detecta los cambios de ruta automáticamente.",
    "Verificá en modo incógnito para ver el widget como lo ve un visitante nuevo.",
  ];

  return (
    <div>
      <SiteSubnav siteId={siteId} siteName={site.name} active="install" pageTitle="Instalación" />

      {/* Snippet card */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
        <h2 className="mb-1 font-[family-name:var(--font-dm-sans)] text-[14px] font-medium text-[var(--text-primary)]">
          Instalación del widget
        </h2>
        <p className="mb-6 font-[family-name:var(--font-dm-sans)] text-[13px] font-light leading-relaxed text-[var(--text-secondary)]">
          Copiá el snippet en tu web. Verificamos automáticamente si el script está publicado.
        </p>
        <InstallSnippet siteId={site.siteId} appUrl={appUrl} verify />
      </div>

      {/* Next steps */}
      <div className="mt-8">
        <h3 className="mb-4 font-syne text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
          Próximos pasos
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {nextSteps.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.href}
                href={step.href}
                className="group flex items-start gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 transition-all duration-150 hover:border-[var(--border-default)] hover:bg-[var(--bg-surface)] hover:-translate-y-px"
              >
                <div
                  className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
                  style={{ background: `color-mix(in srgb, ${step.color} 14%, transparent)` }}
                >
                  <Icon className="size-4" style={{ color: step.color }} />
                </div>
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-dm-sans)] text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors duration-150">
                    {step.title}
                  </p>
                  <p className="mt-0.5 font-[family-name:var(--font-dm-sans)] text-[12px] font-light leading-relaxed text-[var(--text-tertiary)]">
                    {step.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
        <h3 className="mb-4 font-syne text-[14px] font-bold tracking-tight text-[var(--text-primary)]">
          Tips de instalación
        </h3>
        <ul className="space-y-3">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--accent)]" />
              <span className="font-[family-name:var(--font-dm-sans)] text-[13px] font-light leading-relaxed text-[var(--text-secondary)]">
                {tip}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
