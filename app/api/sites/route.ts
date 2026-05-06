import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, type PlanKey } from "@/lib/stripe";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const CreateSiteSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  plan: z.enum(["starter", "pro", "elite"]).optional(),
  agentName: z.string().min(1).max(50).optional(),
  agentRole: z.string().min(1).max(100).optional(),
  agentPersonality: z.string().min(1).max(200).optional(),
  welcomeMessage: z.string().min(1).max(500).optional(),
  systemPrompt: z.string().min(1),
  language: z.string().max(5).optional(),
  brandColor: z.string().optional(),
  brandColor2: z.string().optional(),
  avatarType: z.string().optional(),
  avatarSubtype: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  avatarConfig: z.record(z.string(), z.unknown()).optional(),
  calBookingUrl: z.string().url().optional().or(z.literal("")),
  webhookUrl: z.string().url().optional().or(z.literal("")),
  embedMode: z.enum(["widget", "fullpage"]).optional(),
  primaryQuestion: z.string().max(200).optional(),
  agentType: z.enum(["vendedor", "guia", "soporte", "recepcionista"]).optional(),
  proactiveEnabled: z.boolean().optional(),
  proactiveFrequency: z.enum(["conservador", "normal", "proactivo"]).optional(),
  exitIntentEnabled: z.boolean().optional(),
  widgetPosition: z.enum(["bottom-right", "bottom-left"]).optional(),
});

export async function GET() {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sites = await prisma.site.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { conversations: true } } },
    });

    return NextResponse.json({ sites });
  } catch (error) {
    console.error("GET /api/sites:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = CreateSiteSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation error", details: parsed.error.issues }, { status: 400 });

    const userWithCount = await prisma.user.findUnique({
      where: { id: dbUser.id },
      include: { _count: { select: { sites: true } } },
    });
    if (!userWithCount) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const planLimits = PLANS[dbUser.plan as PlanKey] ?? PLANS.starter;
    if (planLimits.sites !== -1 && userWithCount._count.sites >= planLimits.sites) {
      return NextResponse.json({ error: `Tu plan ${dbUser.plan} solo permite ${planLimits.sites} sitio(s).` }, { status: 403 });
    }

    const site = await prisma.site.create({
      data: {
        name: parsed.data.name,
        url: parsed.data.url,
        userId: dbUser.id,
        plan: dbUser.plan,
        systemPrompt: parsed.data.systemPrompt,
        agentName: parsed.data.agentName,
        agentRole: parsed.data.agentRole,
        agentPersonality: parsed.data.agentPersonality,
        welcomeMessage: parsed.data.welcomeMessage,
        language: parsed.data.language,
        brandColor: parsed.data.brandColor,
        brandColor2: parsed.data.brandColor2,
        avatarType: parsed.data.avatarType,
        avatarSubtype: parsed.data.avatarSubtype,
        logoUrl: parsed.data.logoUrl || null,
        calBookingUrl: parsed.data.calBookingUrl || null,
        webhookUrl: parsed.data.webhookUrl || null,
        embedMode: parsed.data.embedMode,
        primaryQuestion: parsed.data.primaryQuestion,
        agentType: parsed.data.agentType,
        proactiveEnabled: parsed.data.proactiveEnabled,
        proactiveFrequency: parsed.data.proactiveFrequency,
        exitIntentEnabled: parsed.data.exitIntentEnabled,
        widgetPosition: parsed.data.widgetPosition,
        avatarConfig: parsed.data.avatarConfig as Prisma.JsonObject | undefined,
      },
    });

    return NextResponse.json({ site }, { status: 201 });
  } catch (error) {
    console.error("POST /api/sites:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
