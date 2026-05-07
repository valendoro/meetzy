import { NextResponse } from "next/server";
import { z } from "zod";
import { generateAvatar, isCloudinaryConfigured, isFalConfigured } from "@/lib/fal";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { siteToAvatarConfig } from "@/lib/avatar-config";

const BodySchema = z.object({
  sitePublicId: z.string().min(1),
  variation: z.number().int().min(1).max(20).optional(),
});

export const maxDuration = 120;

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

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: "Cloudinary no está configurado; no se puede guardar la imagen en CDN." },
        { status: 503 },
      );
    }

    const config = siteToAvatarConfig(site);
    const seed = parsed.data.variation ?? site.avatarGenerations + 1;
    const avatar = await generateAvatar(config, { requireCloudinary: true, variationSeed: seed });

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
      avatarUrl: avatar.imageUrl,
      avatarGenerations: next.avatarGenerations,
      prompt: avatar.prompt,
    });
  } catch (e) {
    console.error("POST /api/avatar/regenerate", e);
    const msg = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
