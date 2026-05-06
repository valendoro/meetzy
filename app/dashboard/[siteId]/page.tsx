import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import InstallScript from "@/components/dashboard/InstallScript";
import IntentDashboard from "@/components/dashboard/IntentDashboard";

export const metadata = { title: "Detalle del sitio" };

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { siteId } = await params;

  const site = await prisma.site.findFirst({
    where: { siteId, userId: session.user.id },
    include: {
      _count: { select: { conversations: true } },
    },
  });

  if (!site) notFound();

  const [today, week] = await Promise.all([
    prisma.conversation.count({
      where: {
        siteId: site.id,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.conversation.count({
      where: {
        siteId: site.id,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const tabs = [
    { label: "Resumen", href: `/dashboard/${siteId}`, active: true },
    { label: "Conversaciones", href: `/dashboard/${siteId}/conversations`, active: false },
    { label: "Avatar", href: `/dashboard/${siteId}/avatar`, active: false },
    { label: "Configuración", href: `/dashboard/${siteId}/settings`, active: false },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#6b6b6b] mb-6">
        <Link href="/dashboard" className="hover:text-[#F0EDE8] transition-colors">
          Mis sitios
        </Link>
        <span>/</span>
        <span className="text-[#F0EDE8]">{site.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-syne font-bold text-base"
            style={{ backgroundColor: site.brandColor }}
          >
            {site.agentName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-syne font-bold text-2xl text-[#F0EDE8]">{site.name}</h1>
            <p className="text-sm text-[#6b6b6b]">
              {site.url} ·{" "}
              <span className="capitalize text-accent">{site.plan}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${site.isActive ? "bg-green-500" : "bg-[#444]"}`}
          />
          <span className="text-sm text-[#6b6b6b]">
            {site.isActive ? "Activo" : "Pausado"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1e1e1e] mb-8">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab.active
                ? "border-accent text-[#F0EDE8]"
                : "border-transparent text-[#6b6b6b] hover:text-[#F0EDE8]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Intent Dashboard */}
      <div className="mb-8">
        <IntentDashboard siteId={site.siteId} />
      </div>

      {/* Install Script */}
      <InstallScript siteId={site.siteId} appUrl={process.env.NEXT_PUBLIC_APP_URL ?? "https://app.meetzy.ai"} />
    </div>
  );
}
