import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import SiteSubnav from "@/components/dashboard/SiteSubnav";
import AgentTestClient from "./AgentTestClient";

export const metadata = { title: "Probar agente" };

export default async function AgentTestPage({ params }: { params: Promise<{ siteId: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const { siteId } = await params;
  const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
  if (!site) notFound();

  return (
    <div>
      <SiteSubnav siteId={siteId} siteName={site.name} active="test" pageTitle="Probar agente" />
      <AgentTestClient
        siteId={siteId}
        agentName={site.agentName}
        welcomeMessage={site.welcomeMessage}
        brandColor={site.brandColor}
      />
    </div>
  );
}
