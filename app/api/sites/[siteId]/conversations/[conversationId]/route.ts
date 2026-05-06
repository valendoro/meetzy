import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ siteId: string; conversationId: string }> }) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { siteId: publicSiteId, conversationId } = await params;
    const site = await prisma.site.findFirst({
      where: { siteId: publicSiteId, userId: dbUser.id },
    });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, siteId: site.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ conversation });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
