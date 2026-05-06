import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import VisitorsClient from "./VisitorsClient";

export const metadata = { title: "Visitantes" };

export default async function VisitorsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const { siteId } = await params;
  const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
  if (!site) notFound();

  return <VisitorsClient sitePublicId={site.siteId} siteName={site.name} />;
}
