import { NextResponse } from "next/server";
import { z } from "zod";
import { getDbUser } from "@/lib/auth";

const BodySchema = z.object({
  imageBase64: z.string().min(20).max(3_500_000),
  mimeType: z.enum(["image/png", "image/jpeg", "image/webp"]).optional(),
});

/** Devuelve data URL (sin rembg en MVP). */
export async function POST(req: Request) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid image payload" }, { status: 400 });

    let { imageBase64 } = parsed.data;
    const mime = parsed.data.mimeType ?? "image/png";

    if (!imageBase64.startsWith("data:")) {
      imageBase64 = `data:${mime};base64,${imageBase64}`;
    }

    const approxBytes = (imageBase64.length * 3) / 4;
    if (approxBytes > 2_500_000) {
      return NextResponse.json({ error: "Imagen muy grande (máx ~2MB)" }, { status: 400 });
    }

    return NextResponse.json({ url: imageBase64 });
  } catch (e) {
    console.error("upload-logo", e);
    return NextResponse.json({ error: "Error al procesar" }, { status: 500 });
  }
}
