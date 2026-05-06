import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeFullIntent, type VisitorContextLike } from "@/lib/intent-scorer";
import { clientIpFromRequest, lookupGeo } from "@/lib/geoip";
import { inferTrafficSource, upsertVisitorProfile } from "@/lib/visitor-profile-sync";
import { enrichFromMessage, type ExtractedVisitorHints } from "@/lib/visitor-enrichment";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const BodySchema = z.object({
  conversationId: z.string().min(1),
  visitorId: z.string().min(1),
  siteId: z.string().min(1),
  sessionDuration: z.number().int().min(0).optional(),
  activeTime: z.number().int().min(0).optional(),
  pagesVisited: z.array(z.string()).optional(),
  sectionsViewed: z.record(z.string(), z.object({ time: z.number(), revisits: z.number() })).optional(),
  scrollDepth: z.number().int().min(0).max(100).optional(),
  device: z.string().optional(),
  browser: z.string().optional(),
  referrer: z.string().nullable().optional(),
  searchQuery: z.string().nullable().optional(),
  utmSource: z.string().nullable().optional(),
  utmMedium: z.string().nullable().optional(),
  utmCampaign: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const b = parsed.data;

    const site = await prisma.site.findUnique({ where: { siteId: b.siteId } });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const conv = await prisma.conversation.findFirst({
      where: { id: b.conversationId, visitorId: b.visitorId, siteId: site.id },
      include: { messages: { where: { role: "user" }, orderBy: { createdAt: "asc" } } },
    });
    if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    const prevDur = conv.sessionDuration;
    const newDur = b.sessionDuration ?? prevDur;
    const durationDelta = Math.max(0, newDur - prevDur);

    const ip = clientIpFromRequest(req.headers);
    let country: string | null = conv.country;
    let city: string | null = conv.city;
    if (ip && !country) {
      const g = lookupGeo(ip);
      if (g) {
        country = g.country ?? null;
        city = g.city ?? null;
      }
    }

    const source = inferTrafficSource(b.referrer ?? conv.referrer, b.utmSource ?? conv.utmSource);

    const userTexts = conv.messages.map((m) => m.content);
    let hints: ExtractedVisitorHints = {
      email: conv.visitorEmail ?? undefined,
      name: conv.visitorName ?? undefined,
      company: conv.visitorCompany ?? undefined,
    };
    for (const t of userTexts) {
      hints = enrichFromMessage(t, hints);
    }

    const prevVisitCount = await prisma.conversation.count({
      where: { siteId: site.id, visitorId: b.visitorId, id: { not: conv.id } },
    });

    const ctx: VisitorContextLike = {
      timeOnSite: newDur,
      sectionsViewed:
        (b.sectionsViewed as VisitorContextLike["sectionsViewed"]) ??
        (conv.sectionsViewed as VisitorContextLike["sectionsViewed"]) ??
        undefined,
      scrollDepth: b.scrollDepth ?? conv.scrollDepth ?? 0,
      isReturnVisitor: prevVisitCount > 0,
    };

    const { intentScore, intentLabel, intentSignalsLog } = computeFullIntent(userTexts, ctx);

    const pages = b.pagesVisited?.length ? b.pagesVisited : conv.pagesVisited;

    await prisma.conversation.update({
      where: { id: conv.id },
      data: {
        sessionDuration: newDur,
        activeTime: b.activeTime ?? conv.activeTime,
        pagesVisited: pages,
        sectionsViewed: b.sectionsViewed
          ? (b.sectionsViewed as unknown as Prisma.InputJsonValue)
          : conv.sectionsViewed ?? undefined,
        scrollDepth: b.scrollDepth ?? conv.scrollDepth,
        device: b.device ?? conv.device,
        browser: b.browser ?? conv.browser,
        referrer: b.referrer ?? conv.referrer,
        searchQuery: b.searchQuery ?? conv.searchQuery,
        utmSource: b.utmSource ?? conv.utmSource,
        utmMedium: b.utmMedium ?? conv.utmMedium,
        utmCampaign: b.utmCampaign ?? conv.utmCampaign,
        source,
        country: country ?? conv.country,
        city: city ?? conv.city,
        visitorEmail: hints.email ?? conv.visitorEmail,
        visitorName: hints.name ?? conv.visitorName,
        visitorCompany: hints.company ?? conv.visitorCompany,
        intentScore,
        intentLabel,
        intentSignalsLog: intentSignalsLog as unknown as Prisma.InputJsonValue,
      },
    });

    await upsertVisitorProfile({
      internalSiteId: site.id,
      visitorId: b.visitorId,
      email: hints.email ?? conv.visitorEmail,
      name: hints.name ?? conv.visitorName,
      company: hints.company ?? conv.visitorCompany,
      intentScore,
      intentLabel,
      demoBooked: conv.demoBooked,
      sessionDurationAdded: durationDelta,
      messageCountDelta: 0,
      countAsNewVisit: false,
      country,
      source,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
