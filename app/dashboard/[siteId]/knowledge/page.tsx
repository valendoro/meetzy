import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import SiteSubnav from "@/components/dashboard/SiteSubnav";
import KnowledgeClient from "./KnowledgeClient";

export const metadata = { title: "Base de conocimiento" };

export default async function KnowledgePage({ params }: { params: Promise<{ siteId: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const { siteId } = await params;
  const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
  if (!site) notFound();

  const entries = await prisma.knowledgeEntry.findMany({
    where: { siteId: site.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, content: true, type: true, sourceUrl: true, createdAt: true },
  });

  const limit = site.plan === "elite" ? 100 : site.plan === "pro" ? 30 : 10;

  return (
    <div>
      <SiteSubnav siteId={siteId} siteName={site.name} active="knowledge" pageTitle="Base de conocimiento" />
      <KnowledgeClient siteId={siteId} initialEntries={entries} plan={site.plan} limit={limit} />
    </div>
  );
}
