import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AvatarConfigurator from "@/components/dashboard/AvatarConfigurator";

export const metadata = { title: "Avatar" };

export default async function AvatarPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { siteId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  const site = await prisma.site.findFirst({
    where: { siteId, userId: session.user.id },
  });

  if (!site) notFound();

  const tabs = [
    { label: "Resumen", href: `/dashboard/${siteId}`, active: false },
    { label: "Conversaciones", href: `/dashboard/${siteId}/conversations`, active: false },
    { label: "Avatar", href: `/dashboard/${siteId}/avatar`, active: true },
    { label: "Configuración", href: `/dashboard/${siteId}/settings`, active: false },
  ];

  const isPro = (user?.plan ?? "starter") === "pro" || (user?.plan ?? "starter") === "elite";

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[#6b6b6b] mb-6">
        <Link href="/dashboard" className="hover:text-[#F0EDE8] transition-colors">Mis sitios</Link>
        <span>/</span>
        <Link href={`/dashboard/${siteId}`} className="hover:text-[#F0EDE8] transition-colors">{site.name}</Link>
        <span>/</span>
        <span className="text-[#F0EDE8]">Avatar</span>
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

      {!isPro ? (
        <div className="bg-[#111] border border-accent/20 rounded-2xl p-8 text-center max-w-lg mx-auto">
          <p className="text-3xl mb-4">🎭</p>
          <h3 className="font-syne font-bold text-lg text-[#F0EDE8] mb-2">
            Avatar disponible en Plan Pro
          </h3>
          <p className="text-[#6b6b6b] text-sm mb-6">
            El avatar 2D animado con identidad de marca está disponible a partir del Plan Pro ($79/mes).
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-accent text-white font-medium px-6 py-2.5 rounded-xl hover:bg-accent/90 transition-colors"
          >
            Ver planes →
          </Link>
        </div>
      ) : (
        <AvatarConfigurator site={site} />
      )}
    </div>
  );
}
