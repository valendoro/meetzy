import { NextResponse } from "next/server";
import { z } from "zod";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, type PlanKey } from "@/lib/stripe";
import { Prisma } from "@prisma/client";
import type { AvatarArchetype } from "@/lib/avatar-prompt-builder";

const AgentType = z.enum(["vendedor", "guia", "soporte", "recepcionista"]);
const Arch = z.enum([
  "human_male",
  "human_female",
  "dog",
  "cat",
  "rabbit",
  "fox",
  "panda",
  "bear",
  "orange",
  "apple",
  "cup",
  "star",
  "rocket",
  "diamond",
]);

const BodySchema = z.object({
  businessName: z.string().min(1).max(120),
  url: z.string().min(1).max(2000),
  agentName: z.string().min(1).max(60),
  brandColor: z.string().min(1),
  brandColor2: z.string().min(1).optional(),
  logoUrl: z.string().max(600_000).optional().nullable(),
  avatarImageUrl: z.string().max(5000).optional().nullable(),
  archetype: Arch,
  agentType: AgentType,
  systemPrompt: z.string().min(10),
  detectedLanguage: z.string().max(8).optional(),
  embedMode: z.enum(["widget", "fullpage"]).optional(),
  welcomeMessage: z.string().max(500).optional(),
  agentPersonality: z.string().max(200).optional(),
});

const ROLE: Record<z.infer<typeof AgentType>, string> = {
  vendedor: "vendedor",
  guia: "guía de bienvenida",
  soporte: "soporte técnico",
  recepcionista: "asistente virtual",
};

function dbAvatarFromArchetype(archetype: AvatarArchetype) {
  if (archetype === "human_male") return { avatarType: "human", avatarSubtype: "male" };
  if (archetype === "human_female") return { avatarType: "human", avatarSubtype: "female" };
  const animals: AvatarArchetype[] = ["dog", "cat", "rabbit", "fox", "panda", "bear"];
  if (animals.includes(archetype)) {
    const m: Record<string, string> = {
      dog: "perro",
      cat: "gato",
      rabbit: "conejo",
      fox: "zorro",
      panda: "panda",
      bear: "oso",
    };
    return { avatarType: "animal", avatarSubtype: m[archetype] ?? "perro" };
  }
  const om: Record<string, string> = {
    orange: "naranja",
    apple: "manzana",
    cup: "taza",
    star: "estrella",
    rocket: "cohete",
    diamond: "diamante",
  };
  return { avatarType: "object", avatarSubtype: om[archetype] ?? "taza" };
}

export async function POST(req: Request) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", details: parsed.error.issues }, { status: 400 });
    }

    const userWithCount = await prisma.user.findUnique({
      where: { id: dbUser.id },
      include: { _count: { select: { sites: true } } },
    });
    if (!userWithCount) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const planLimits = PLANS[dbUser.plan as PlanKey] ?? PLANS.starter;
    if (planLimits.sites !== -1 && userWithCount._count.sites >= planLimits.sites) {
      return NextResponse.json({ error: `Tu plan ${dbUser.plan} solo permite ${planLimits.sites} sitio(s).` }, { status: 403 });
    }

    const p = parsed.data;
    let normalizedUrl = p.url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }

    const av = dbAvatarFromArchetype(p.archetype as AvatarArchetype);

    const site = await prisma.site.create({
      data: {
        name: p.businessName,
        url: normalizedUrl,
        userId: dbUser.id,
        plan: dbUser.plan,
        systemPrompt: p.systemPrompt,
        agentName: p.agentName,
        agentRole: ROLE[p.agentType],
        agentPersonality: p.agentPersonality ?? "amigable y profesional",
        welcomeMessage: p.welcomeMessage ?? "¡Hola! ¿En qué te puedo ayudar hoy?",
        language: p.detectedLanguage ?? "es",
        brandColor: p.brandColor,
        brandColor2: p.brandColor2 ?? p.brandColor,
        avatarType: av.avatarType,
        avatarSubtype: av.avatarSubtype,
        logoUrl: p.logoUrl && p.logoUrl.length > 0 ? p.logoUrl : null,
        embedMode: p.embedMode ?? "widget",
        agentType: p.agentType,
        avatarImageUrl: p.avatarImageUrl && p.avatarImageUrl.length > 0 ? p.avatarImageUrl : null,
        onboardingCompleted: true,
        onboardingStep: 3,
        avatarGenerations: 0,
        avatarConfig: {
          onboardingArchetype: p.archetype,
        } as Prisma.JsonObject,
      },
    });

    return NextResponse.json({ siteId: site.siteId, site });
  } catch (e) {
    console.error("onboarding/complete", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

