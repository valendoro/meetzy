import { NextResponse } from "next/server";
import { z } from "zod";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAvatarPrompt, type AvatarArchetype } from "@/lib/avatar-prompt-builder";
import { generateFluxAvatarImage, isFalConfigured } from "@/lib/fal";
import type { Prisma } from "@prisma/client";

const BodySchema = z.object({
  sitePublicId: z.string().min(1),
  variation: z.number().int().min(1).max(20).optional(),
});

export const maxDuration = 60;

function archetypeFromSite(site: {
  avatarConfig: Prisma.JsonValue;
  avatarType: string | null;
  avatarSubtype: string | null;
}): AvatarArchetype {
  const cfg = site.avatarConfig as { onboardingArchetype?: string } | null;
  if (cfg?.onboardingArchetype && typeof cfg.onboardingArchetype === "string") {
    return cfg.onboardingArchetype as AvatarArchetype;
  }
  if (site.avatarType === "human") {
    return site.avatarSubtype === "female" ? "human_female" : "human_male";
  }
  if (site.avatarType === "animal") {
    const s = site.avatarSubtype ?? "dog";
    const map: Record<string, AvatarArchetype> = {
      perro: "dog",
      gato: "cat",
      conejo: "rabbit",
      zorro: "fox",
      panda: "panda",
      oso: "bear",
    };
    return map[s] ?? "dog";
  }
  const s = site.avatarSubtype ?? "cup";
  const omap: Record<string, AvatarArchetype> = {
    naranja: "orange",
    manzana: "apple",
    taza: "cup",
    estrella: "star",
    cohete: "rocket",
    diamante: "diamond",
  };
  return omap[s] ?? "cup";
}

export async function POST(req: Request) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const site = await prisma.site.findFirst({
      where: { siteId: parsed.data.sitePublicId, userId: dbUser.id },
    });
    if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (site.avatarGenerations >= 3) {
      return NextResponse.json({ error: "Límite de regeneraciones alcanzado (3)." }, { status: 429 });
    }

    if (!isFalConfigured()) {
      return NextResponse.json({ avatarUrl: null, fallback: true }, { status: 200 });
    }

    const arch = archetypeFromSite(site);
    const prompt = buildAvatarPrompt({
      archetype: arch,
      brandColor: site.brandColor,
      brandColor2: site.brandColor2,
      businessName: site.name,
      agentName: site.agentName,
      logoUrl: site.logoUrl,
      variation: parsed.data.variation ?? site.avatarGenerations + 1,
    });

    const { url } = await generateFluxAvatarImage(prompt, parsed.data.variation ?? site.avatarGenerations + 1);
    if (!url) {
      return NextResponse.json({ avatarUrl: null, fallback: true }, { status: 200 });
    }

    const next = await prisma.site.update({
      where: { id: site.id },
      data: {
        avatarImageUrl: url,
        avatarGenerations: { increment: 1 },
      },
    });

    return NextResponse.json({ avatarUrl: url, avatarGenerations: next.avatarGenerations });
  } catch (e) {
    console.error("POST /api/avatar/regenerate", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
