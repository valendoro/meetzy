import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteSettingsForm from "@/components/dashboard/SiteSettingsForm";

export const metadata = { title: "Configuración" };

export default async function SiteSettingsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) return null;

  const { siteId } = await params;
  const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
  if (!site) notFound();

  const tabs = [
    { label: "Resumen", href: `/dashboard/${siteId}`, active: false },
    { label: "Conversaciones", href: `/dashboard/${siteId}/conversations`, active: false },
    { label: "Avatar", href: `/dashboard/${siteId}/avatar`, active: false },
    { label: "Configuración", href: `/dashboard/${siteId}/settings`, active: true },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "rgba(236,234,229,0.4)" }}>
        <Link href="/dashboard">Mis sitios</Link>
        <span>/</span>
        <Link href={`/dashboard/${siteId}`}>{site.name}</Link>
        <span>/</span>
        <span className="text-[#eceae5]">Configuración</span>
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

      <SiteSettingsForm site={site} />
    </div>
  );
}
