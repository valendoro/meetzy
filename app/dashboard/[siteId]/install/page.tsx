import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InstallSnippet from "@/components/dashboard/InstallSnippet";
import SiteSubnav from "@/components/dashboard/SiteSubnav";
import { notFound, redirect } from "next/navigation";

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

  return (
    <div>
      <SiteSubnav siteId={siteId} siteName={site.name} active="install" pageTitle="Instalación" />

      <div className="dash-card p-6 pl-7">
        <h2 className="dash-chart-head mb-2 text-[1.05rem]">Instalación del widget</h2>
        <p className="mb-6 text-sm leading-relaxed text-[color:var(--c-muted)]">
          Copiá el snippet en tu web. Verificamos automáticamente si el script está publicado (no es instantáneo en CDN).
        </p>
        <InstallSnippet siteId={site.siteId} appUrl={appUrl} verify />
      </div>
    </div>
  );
}
