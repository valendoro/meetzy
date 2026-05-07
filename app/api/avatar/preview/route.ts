import { NextResponse } from "next/server";
import { z } from "zod";
import { generateAvatarPreview, isFalConfigured } from "@/lib/fal";
import { avatarPreviewIpRatelimit } from "@/lib/redis";

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

const BodySchema = z.object({
  config: AvatarConfigSchema,
});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { success } = await avatarPreviewIpRatelimit.limit(ip || "unknown");
    if (!success) {
      return NextResponse.json({ error: "Rate limit — máximo 5 previews por hora." }, { status: 429 });
    }

    if (!isFalConfigured()) {
      return NextResponse.json({ error: "FAL_KEY no configurada." }, { status: 503 });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.issues }, { status: 400 });
    }

    const c = parsed.data.config;
    const preview = await generateAvatarPreview({
      style: c.style,
      businessType: c.businessType,
      characterType: c.characterType,
      brandColor: c.brandColor,
      brandColor2: c.brandColor2,
      logoUrl: c.logoUrl?.trim() || undefined,
      agentName: c.agentName,
      freeDescription: c.freeDescription,
    });

    return NextResponse.json({
      previewUrl: preview.imageUrl,
      prompt: preview.prompt,
      generationId: preview.generationId,
    });
  } catch (e) {
    console.error("POST /api/avatar/preview", e);
    const msg = e instanceof Error ? e.message : "Preview failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
