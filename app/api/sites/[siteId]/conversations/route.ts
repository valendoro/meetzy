import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { siteId: publicSiteId } = await params;
    const site = await prisma.site.findFirst({
      where: { siteId: publicSiteId, userId: dbUser.id },
    });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number.parseInt(sp.get("page") ?? "1", 10) || 1);
    const intent = sp.get("intent")?.trim();
    const hasEmail = sp.get("hasEmail");
    const minDur = sp.get("minDuration") ? Number.parseInt(sp.get("minDuration")!, 10) : undefined;
    const maxDur = sp.get("maxDuration") ? Number.parseInt(sp.get("maxDuration")!, 10) : undefined;
    const fromRaw = sp.get("from");
    const toRaw = sp.get("to");
    const from = fromRaw ? new Date(fromRaw) : undefined;
    const to = toRaw ? new Date(toRaw) : undefined;

    const where: Prisma.ConversationWhereInput = { siteId: site.id };
    if (intent && intent !== "all") {
      where.intentLabel = intent;
    }
    if (hasEmail === "true") {
      where.visitorEmail = { not: null };
    } else if (hasEmail === "false") {
      where.visitorEmail = null;
    }
    const durFilter: Prisma.IntFilter = {};
    if (minDur !== undefined && !Number.isNaN(minDur)) {
      durFilter.gte = minDur;
    }
    if (maxDur !== undefined && !Number.isNaN(maxDur)) {
      durFilter.lte = maxDur;
    }
    if (Object.keys(durFilter).length > 0) {
      where.sessionDuration = durFilter;
    }
    if ((from && !Number.isNaN(from.getTime())) || (to && !Number.isNaN(to.getTime()))) {
      where.createdAt = {};
      if (from && !Number.isNaN(from.getTime())) where.createdAt.gte = from;
      if (to && !Number.isNaN(to.getTime())) where.createdAt.lte = to;
    }

    const [total, items] = await prisma.$transaction([
      prisma.conversation.count({ where }),
      prisma.conversation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 1,
            where: { role: "user" },
            select: { content: true, createdAt: true },
          },
          _count: { select: { messages: true } },
        },
      }),
    ]);

    const mapped = items.map((c) => ({
      id: c.id,
      visitorId: c.visitorId,
      createdAt: c.createdAt,
      intentScore: c.intentScore,
      intentLabel: c.intentLabel,
      sessionDuration: c.sessionDuration,
      messageCount: c._count.messages,
      country: c.country,
      device: c.device,
      visitorEmail: c.visitorEmail,
      preview: c.messages[0]?.content ?? "",
    }));

    return NextResponse.json({
      items: mapped,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
