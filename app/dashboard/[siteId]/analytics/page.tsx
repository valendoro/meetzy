import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import AnalyticsPageClient from "./AnalyticsPageClient";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const { siteId } = await params;
  const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
  if (!site) notFound();

  return <AnalyticsPageClient sitePublicId={site.siteId} siteName={site.name} />;
}
