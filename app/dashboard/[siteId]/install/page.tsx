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

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
        <h2 className="mb-1 font-[family-name:var(--font-dm-sans)] text-[14px] font-medium text-[var(--text-primary)]">
          Instalación del widget
        </h2>
        <p className="mb-6 font-[family-name:var(--font-dm-sans)] text-[13px] font-light leading-relaxed text-[var(--text-secondary)]">
          Copiá el snippet en tu web. Verificamos automáticamente si el script está publicado.
        </p>
        <InstallSnippet siteId={site.siteId} appUrl={appUrl} verify />
      </div>
    </div>
  );
}
