import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
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
  avatarImageUrl: z.string().nullable().optional(),
  avatarConfig: z.record(z.string(), z.unknown()).nullable().optional(),
  voiceEnabled: z.boolean().optional(),
  voiceId: z.string().nullable().optional(),
  calBookingUrl: z.string().nullable().optional(),
  webhookUrl: z.string().nullable().optional(),
  agentType: z.enum(["vendedor", "guia", "soporte", "recepcionista"]).optional(),
  proactiveEnabled: z.boolean().optional(),
  proactiveFrequency: z.enum(["conservador", "normal", "proactivo"]).optional(),
  exitIntentEnabled: z.boolean().optional(),
  widgetPosition: z.enum(["bottom-right", "bottom-left"]).optional(),
});

async function findSite(siteId: string, userId: string) {
  return prisma.site.findFirst({ where: { siteId, userId } });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { siteId } = await params;
    const site = await findSite(siteId, dbUser.id);
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
    const [total, today] = await Promise.all([
      prisma.conversation.count({ where: { siteId: site.id } }),
      prisma.conversation.count({ where: { siteId: site.id, createdAt: { gte: new Date(Date.now() - 86400000) } } }),
    ]);
    return NextResponse.json({ site, metrics: { totalConversations: total, recentConversations: today } });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { siteId } = await params;
    const site = await findSite(siteId, dbUser.id);
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
    const body = await req.json();
    const parsed = UpdateSiteSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation error" }, { status: 400 });
    const { avatarConfig, ...rest } = parsed.data;
    const updated = await prisma.site.update({
      where: { id: site.id },
      data: {
        ...rest,
        ...(avatarConfig !== undefined
          ? { avatarConfig: avatarConfig === null ? Prisma.JsonNull : (avatarConfig as Prisma.JsonObject) }
          : {}),
      },
    });
    return NextResponse.json({ site: updated });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { siteId } = await params;
    const site = await findSite(siteId, dbUser.id);
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      const conversations = await tx.conversation.findMany({
        where: { siteId: site.id },
        select: { id: true },
      });
      const convIds = conversations.map((c) => c.id);
      if (convIds.length > 0) {
        await tx.message.deleteMany({ where: { conversationId: { in: convIds } } });
      }
      await tx.visitorProfile.deleteMany({ where: { siteId: site.id } });
      await tx.conversation.deleteMany({ where: { siteId: site.id } });
      await tx.site.delete({ where: { id: site.id } });
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
