import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import VisitorDetailClient from "./VisitorDetailClient";

export const metadata = { title: "Perfil del visitante" };

export default async function VisitorProfilePage({
  params,
}: {
  params: Promise<{ siteId: string; visitorId: string }>;
}) {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const { siteId, visitorId } = await params;
  const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
  if (!site) notFound();

  return <VisitorDetailClient sitePublicId={site.siteId} siteName={site.name} visitorId={visitorId} />;
}
