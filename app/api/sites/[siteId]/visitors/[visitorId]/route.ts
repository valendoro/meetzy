import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import type { IntentSignalEntry } from "@/lib/intent-scorer";

const PatchSchema = z.object({
  markContacted: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ siteId: string; visitorId: string }> }) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { siteId: publicSiteId, visitorId } = await params;
    const site = await prisma.site.findFirst({
      where: { siteId: publicSiteId, userId: dbUser.id },
    });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const profile = await prisma.visitorProfile.findUnique({
      where: { visitorId_siteId: { visitorId, siteId: site.id } },
    });
    if (!profile) return NextResponse.json({ error: "Visitor not found" }, { status: 404 });

    const conversations = await prisma.conversation.findMany({
      where: { siteId: site.id, visitorId },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        messages: { orderBy: { createdAt: "asc" }, take: 200 },
      },
    });

    const latest = conversations[0];
    let journey: { section: string; seconds: number }[] = [];
    if (latest?.sectionsViewed && typeof latest.sectionsViewed === "object") {
      const sv = latest.sectionsViewed as Record<string, { time?: number; revisits?: number }>;
      journey = Object.entries(sv).map(([section, v]) => ({
        section,
        seconds: Math.round(v?.time ?? 0),
      }));
    }

    const signals =
      (latest?.intentSignalsLog as IntentSignalEntry[] | null)?.filter(
        (s): s is IntentSignalEntry => typeof s?.id === "string" && typeof s?.label === "string",
      ) ?? [];

    return NextResponse.json({ profile, conversations, journey, latestSignals: signals });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ siteId: string; visitorId: string }> }) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { siteId: publicSiteId, visitorId } = await params;
    const site = await prisma.site.findFirst({
      where: { siteId: publicSiteId, userId: dbUser.id },
    });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const data: Prisma.VisitorProfileUpdateInput = {};
    if (parsed.data.markContacted === true) {
      data.contactedAt = new Date();
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No updates" }, { status: 400 });
    }

    const profile = await prisma.visitorProfile.update({
      where: { visitorId_siteId: { visitorId, siteId: site.id } },
      data,
    });

    return NextResponse.json({ profile });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
