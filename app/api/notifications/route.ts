import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subHours } from "date-fns";

export async function GET() {
  const dbUser = await getDbUser();
  if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sites = await prisma.site.findMany({
    where: { userId: dbUser.id },
    select: { id: true, siteId: true, name: true },
  });

  if (sites.length === 0) return NextResponse.json({ hotLeads: [], total: 0 });

  const since = subHours(new Date(), 24);

  const recentHotLeads = await prisma.conversation.findMany({
    where: {
      siteId: { in: sites.map((s) => s.id) },
      intentLabel: { in: ["hot_lead", "ready_to_buy"] },
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      siteId: true,
      visitorName: true,
      visitorEmail: true,
      intentLabel: true,
      intentScore: true,
      createdAt: true,
    },
  });

  // Map internal siteId → public siteId
  const siteMap = new Map(sites.map((s) => [s.id, s]));

  const hotLeads = recentHotLeads.map((c) => {
    const site = siteMap.get(c.siteId);
    return {
      conversationId: c.id,
      siteId: site?.siteId ?? "",
      siteName: site?.name ?? "",
      visitorName: c.visitorName,
      visitorEmail: c.visitorEmail,
      intentLabel: c.intentLabel,
      intentScore: c.intentScore,
      createdAt: c.createdAt,
    };
  });

  return NextResponse.json({ hotLeads, total: hotLeads.length });
}
