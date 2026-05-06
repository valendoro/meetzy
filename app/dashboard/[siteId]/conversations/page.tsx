import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import ConversationsClient from "./ConversationsClient";

export const metadata = { title: "Conversaciones" };

export default async function ConversationsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const { siteId } = await params;
  const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
  if (!site) notFound();

  return <ConversationsClient sitePublicId={site.siteId} siteName={site.name} />;
}
