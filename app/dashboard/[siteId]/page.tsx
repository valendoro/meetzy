import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import InstallScript from "@/components/dashboard/InstallScript";
import IntentDashboard from "@/components/dashboard/IntentDashboard";

export const metadata = { title: "Detalle del sitio" };

export default async function SiteDetailPage({ params }: { params: Promise<{ siteId: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const { siteId } = await params;
  const site = await prisma.site.findFirst({
    where: { siteId, userId: dbUser.id },
    include: { _count: { select: { conversations: true } } },
  });
  if (!site) notFound();

  const tabs = [
    { label: "Resumen", href: `/dashboard/${siteId}`, active: true },
    { label: "Conversaciones", href: `/dashboard/${siteId}/conversations`, active: false },
    { label: "Avatar", href: `/dashboard/${siteId}/avatar`, active: false },
    { label: "Configuración", href: `/dashboard/${siteId}/settings`, active: false },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "rgba(236,234,229,0.4)" }}>
        <Link href="/dashboard" className="hover:text-[#eceae5] transition-colors">Mis sitios</Link>
        <span>/</span>
        <span className="text-[#eceae5]">{site.name}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-syne font-bold text-base"
            style={{ backgroundColor: site.brandColor }}>
            {site.agentName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-syne font-bold text-2xl text-[#eceae5]">{site.name}</h1>
            <p className="text-sm" style={{ color: "rgba(236,234,229,0.4)" }}>
              {site.url} · <span className="text-accent capitalize">{site.plan}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${site.isActive ? "bg-green-500" : "bg-[#444]"}`} />
          <span className="text-sm" style={{ color: "rgba(236,234,229,0.4)" }}>
            {site.isActive ? "Activo" : "Pausado"}
          </span>
        </div>
      </div>

      <div className="flex gap-1 border-b mb-8" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        {tabs.map(tab => (
          <Link key={tab.label} href={tab.href}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab.active ? "border-accent text-[#eceae5]" : "border-transparent hover:text-[#eceae5]"
            }`}
            style={{ color: tab.active ? undefined : "rgba(236,234,229,0.4)" }}>
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mb-8">
        <IntentDashboard siteId={site.siteId} />
      </div>

      <InstallScript siteId={site.siteId} appUrl={process.env.NEXT_PUBLIC_APP_URL ?? "https://app.meetzy.ai"} />
    </div>
  );
}
