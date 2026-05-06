import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import AvatarConfigurator from "@/components/dashboard/AvatarConfigurator";
import SiteSubnav from "@/components/dashboard/SiteSubnav";

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
        <div className="dash-panel max-w-lg mx-auto p-10 text-center">
          <p className="text-3xl mb-4">🎭</p>
          <h3 className="font-syne font-bold text-lg text-[color:var(--c-text)] mb-2">Avatar disponible en Plan Pro</h3>
          <p className="text-sm mb-6 text-[color:var(--c-muted)]">
            El avatar 2D animado con identidad de marca está disponible a partir del Plan Pro ($79/mes).
          </p>
          <Link href="/pricing" className="btn-primary no-underline inline-flex">
            Ver planes →
          </Link>
        </div>
      ) : (
        <AvatarConfigurator site={site} />
      )}
    </div>
  );
}
