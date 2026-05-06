import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const UpdateSiteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  agentName: z.string().min(1).max(50).optional(),
  agentRole: z.string().min(1).max(100).optional(),
  agentPersonality: z.string().min(1).max(200).optional(),
  welcomeMessage: z.string().min(1).max(500).optional(),
  systemPrompt: z.string().min(1).optional(),
  language: z.string().max(5).optional(),
  brandColor: z.string().optional(),
  brandColor2: z.string().optional(),
  avatarType: z.string().nullable().optional(),
  avatarSubtype: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  avatarConfig: z.record(z.string(), z.unknown()).nullable().optional(),
  voiceEnabled: z.boolean().optional(),
  voiceId: z.string().nullable().optional(),
  simliAvatarId: z.string().nullable().optional(),
  calBookingUrl: z.string().nullable().optional(),
  webhookUrl: z.string().nullable().optional(),
});

async function getSiteForUser(siteId: string, userId: string) {
  return prisma.site.findFirst({
    where: { siteId, userId },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;
    const site = await getSiteForUser(siteId, session.user.id);

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const [totalConversations, recentConversations] = await Promise.all([
      prisma.conversation.count({ where: { siteId: site.id } }),
      prisma.conversation.count({
        where: {
          siteId: site.id,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return NextResponse.json({
      site,
      metrics: { totalConversations, recentConversations },
    });
  } catch (error) {
    console.error("GET /api/sites/[siteId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;
    const site = await getSiteForUser(siteId, session.user.id);

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = UpdateSiteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { avatarConfig, ...restData } = parsed.data;
    const updated = await prisma.site.update({
      where: { id: site.id },
      data: {
        ...restData,
        ...(avatarConfig !== undefined
          ? { avatarConfig: avatarConfig === null ? Prisma.JsonNull : (avatarConfig as Prisma.JsonObject) }
          : {}),
      },
    });

    return NextResponse.json({ site: updated });
  } catch (error) {
    console.error("PATCH /api/sites/[siteId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;
    const site = await getSiteForUser(siteId, session.user.id);

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    await prisma.site.update({
      where: { id: site.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/sites/[siteId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
