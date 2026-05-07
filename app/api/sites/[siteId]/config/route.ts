import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const site = await prisma.site.findUnique({
      where: { siteId },
      select: {
        agentName: true,
        agentRole: true,
        brandColor: true,
        brandColor2: true,
        welcomeMessage: true,
        avatarType: true,
        avatarSubtype: true,
        avatarImageUrl: true,
        avatarConfig: true,
        plan: true,
        voiceEnabled: true,
        simliAvatarId: true,
        calBookingUrl: true,
        isActive: true,
        embedMode: true,
        primaryQuestion: true,
        agentType: true,
        proactiveEnabled: true,
        proactiveFrequency: true,
        exitIntentEnabled: true,
        widgetPosition: true,
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    return NextResponse.json(site, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("GET config error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
