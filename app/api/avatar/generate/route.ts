import { NextResponse } from "next/server";
import { z } from "zod";
import { getDbUser } from "@/lib/auth";
import { buildAvatarPrompt, type AvatarArchetype } from "@/lib/avatar-prompt-builder";
import { generateFluxAvatarImage, isFalConfigured } from "@/lib/fal";

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

const BodySchema = z.object({
  archetype: Archetypes,
  brandColor: z.string().min(1),
  brandColor2: z.string().optional(),
  businessName: z.string().min(1).max(120),
  agentName: z.string().min(1).max(60),
  logoUrl: z.string().max(600_000).optional().nullable(),
  variation: z.number().int().min(0).max(20).optional(),
});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.issues }, { status: 400 });
    }

    if (!isFalConfigured()) {
      return NextResponse.json(
        { avatarUrl: null, fallback: true, error: "FAL_KEY not configured — usando preview local." },
        { status: 200 },
      );
    }

    const p = parsed.data;
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
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
