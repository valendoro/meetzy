import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteSettingsForm from "@/components/dashboard/SiteSettingsForm";

export const metadata = { title: "Configuración" };

export default async function SiteSettingsPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { siteId } = await params;

  const site = await prisma.site.findFirst({
    where: { siteId, userId: session.user.id },
  });

  if (!site) notFound();

  const tabs = [
    { label: "Resumen", href: `/dashboard/${siteId}`, active: false },
    { label: "Conversaciones", href: `/dashboard/${siteId}/conversations`, active: false },
    { label: "Avatar", href: `/dashboard/${siteId}/avatar`, active: false },
    { label: "Configuración", href: `/dashboard/${siteId}/settings`, active: true },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[#6b6b6b] mb-6">
        <Link href="/dashboard" className="hover:text-[#F0EDE8] transition-colors">Mis sitios</Link>
        <span>/</span>
        <Link href={`/dashboard/${siteId}`} className="hover:text-[#F0EDE8] transition-colors">{site.name}</Link>
        <span>/</span>
        <span className="text-[#F0EDE8]">Configuración</span>
      </div>

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

      <SiteSettingsForm site={site} />
    </div>
  );
}
