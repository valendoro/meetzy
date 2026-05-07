import { NextResponse } from "next/server";
import { z } from "zod";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAvatarPrompt, type AvatarArchetype } from "@/lib/avatar-prompt-builder";
import {
  generateAvatar,
  generateFluxAvatarImage,
  isCloudinaryConfigured,
  isFalConfigured,
} from "@/lib/fal";
import { avatarGenerateUserRatelimit } from "@/lib/redis";

const Archetypes = z.enum([
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

const AvatarConfigSchema = z.object({
  style: z.enum(["realistic", "cartoon", "object"]),
  businessType: z.string().min(1).max(200),
  characterType: z.string().min(1).max(240),
  brandColor: z.string().min(1),
  brandColor2: z.string().optional(),
  logoUrl: z.union([z.string().url(), z.literal("")]).optional().nullable(),
  agentName: z.string().min(1).max(80),
  freeDescription: z.string().max(800).optional(),
});

const NewBodySchema = z.object({
  siteId: z.string().min(1),
  config: AvatarConfigSchema,
});

const LegacyBodySchema = z.object({
  archetype: Archetypes,
  brandColor: z.string().min(1),
  brandColor2: z.string().optional(),
  businessName: z.string().min(1).max(120),
  agentName: z.string().min(1).max(60),
  logoUrl: z.string().max(600_000).optional().nullable(),
  variation: z.number().int().min(0).max(20).optional(),
});

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const json = await req.json();

    const parsedNew = NewBodySchema.safeParse(json);
    if (parsedNew.success) {
      const dbUser = await getDbUser();
      if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { siteId, config } = parsedNew.data;
      const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
      if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

      const { success } = await avatarGenerateUserRatelimit.limit(dbUser.email);
      if (!success) {
        return NextResponse.json({ error: "Daily avatar generation limit reached (10)." }, { status: 429 });
      }

      if (site.avatarGenerations >= 3) {
        return NextResponse.json({ error: "Max regenerations reached for this site (3)." }, { status: 429 });
      }

      if (!isFalConfigured()) {
        return NextResponse.json(
          { error: "FAL_KEY not configured", avatarUrl: null, fallback: true },
          { status: 503 },
        );
      }

      if (!isCloudinaryConfigured()) {
        return NextResponse.json(
          {
            error:
              "Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.",
          },
          { status: 503 },
        );
      }

      const normalizedLogo = config.logoUrl?.trim() || undefined;
      const avatar = await generateAvatar(
        {
          style: config.style,
          businessType: config.businessType,
          characterType: config.characterType,
          brandColor: config.brandColor,
          brandColor2: config.brandColor2,
          logoUrl: normalizedLogo,
          agentName: config.agentName,
          freeDescription: config.freeDescription,
        },
        { requireCloudinary: true },
      );

      const next = await prisma.site.update({
        where: { id: site.id },
        data: {
          avatarImageUrl: avatar.imageUrl,
          avatarStyle: config.style,
          avatarPrompt: avatar.prompt,
          avatarGenerations: { increment: 1 },
          avatarLastGenerated: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        avatarUrl: avatar.imageUrl,
        prompt: avatar.prompt,
        generationsUsed: next.avatarGenerations,
        generationsRemaining: Math.max(0, 3 - next.avatarGenerations),
      });
    }

    const parsedLegacy = LegacyBodySchema.safeParse(json);
    if (!parsedLegacy.success) {
      return NextResponse.json({ error: "Invalid body", details: parsedLegacy.error.issues }, { status: 400 });
    }

    if (!isFalConfigured()) {
      return NextResponse.json(
        { avatarUrl: null, fallback: true, error: "FAL_KEY not configured — usando preview local." },
        { status: 200 },
      );
    }

    const p = parsedLegacy.data;
    const prompt = buildAvatarPrompt({
      archetype: p.archetype as AvatarArchetype,
      brandColor: p.brandColor,
      brandColor2: p.brandColor2,
      businessName: p.businessName,
      agentName: p.agentName,
      logoUrl: p.logoUrl,
      variation: p.variation,
    });

    const { url, error } = await generateFluxAvatarImage(prompt, p.variation);
    if (!url) {
      return NextResponse.json({
        avatarUrl: null,
        fallback: true,
        error: error ?? "Generation failed",
        generationId: crypto.randomUUID(),
      });
    }

    return NextResponse.json({
      avatarUrl: url,
      fallback: false,
      generationId: crypto.randomUUID(),
      promptUsed: prompt.slice(0, 500),
    });
  } catch (e) {
    console.error("POST /api/avatar/generate", e);
    const msg = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
