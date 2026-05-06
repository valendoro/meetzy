import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import AvatarConfigurator from "@/components/dashboard/AvatarConfigurator";

export const metadata = { title: "Avatar" };

export default async function AvatarPage({ params }: { params: Promise<{ siteId: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const { siteId } = await params;
  const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
  if (!site) notFound();

  const isPro = dbUser.plan === "pro" || dbUser.plan === "elite";

  const tabs = [
    { label: "Resumen", href: `/dashboard/${siteId}`, active: false },
    { label: "Conversaciones", href: `/dashboard/${siteId}/conversations`, active: false },
    { label: "Avatar", href: `/dashboard/${siteId}/avatar`, active: true },
    { label: "Configuración", href: `/dashboard/${siteId}/settings`, active: false },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "rgba(236,234,229,0.4)" }}>
        <Link href="/dashboard">Mis sitios</Link>
        <span>/</span>
        <Link href={`/dashboard/${siteId}`}>{site.name}</Link>
        <span>/</span>
        <span className="text-[#eceae5]">Avatar</span>
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

      {!isPro ? (
        <div className="bg-[#0e0e12] border border-accent/20 rounded-2xl p-8 text-center max-w-lg mx-auto">
          <p className="text-3xl mb-4">🎭</p>
          <h3 className="font-syne font-bold text-lg text-[#eceae5] mb-2">Avatar disponible en Plan Pro</h3>
          <p className="text-sm mb-6" style={{ color: "rgba(236,234,229,0.4)" }}>
            El avatar 2D animado con identidad de marca está disponible a partir del Plan Pro ($79/mes).
          </p>
          <Link href="/pricing" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex" }}>
            Ver planes →
          </Link>
        </div>
      ) : (
        <AvatarConfigurator site={site} />
      )}
    </div>
  );
}
