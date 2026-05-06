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
    const search = sp.get("search")?.trim();
    const intent = sp.get("intent")?.trim();
    const source = sp.get("source")?.trim();
    const country = sp.get("country")?.trim();
    const fromRaw = sp.get("from");
    const toRaw = sp.get("to");
    const from = fromRaw ? new Date(fromRaw) : undefined;
    const to = toRaw ? new Date(toRaw) : undefined;

    const where: Prisma.VisitorProfileWhereInput = { siteId: site.id };
    if (intent && intent !== "all") {
      where.maxIntentLabel = intent;
    }
    if (source && source !== "all") {
      where.topSource = source;
    }
    if (country && country !== "all") {
      where.country = country;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { visitorId: { contains: search, mode: "insensitive" } },
      ];
    }
    if ((from && !Number.isNaN(from.getTime())) || (to && !Number.isNaN(to.getTime()))) {
      where.lastSeenAt = {};
      if (from && !Number.isNaN(from.getTime())) where.lastSeenAt.gte = from;
      if (to && !Number.isNaN(to.getTime())) where.lastSeenAt.lte = to;
    }

    const [total, items] = await prisma.$transaction([
      prisma.visitorProfile.count({ where }),
      prisma.visitorProfile.findMany({
        where,
        orderBy: { lastSeenAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    return NextResponse.json({
      items,
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
