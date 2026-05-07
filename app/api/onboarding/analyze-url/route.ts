import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { isOpenAIConfigured } from "@/lib/openai";
import { scrapeRatelimit } from "@/lib/redis";
import { scrapeUrl } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { error: "OPENAI no configurado — no podemos analizar la URL todavía." },
        { status: 503 },
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? `user:${dbUser.id}`;

    const { success } = await scrapeRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
    }

    const body = (await req.json()) as { url?: string };
    let url = body.url?.trim() ?? "";
    if (!url) return NextResponse.json({ error: "URL requerida" }, { status: 400 });
    if (!url.startsWith("http://") && !url.startsWith("https://")) url = `https://${url}`;
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }

    const result = await scrapeUrl(url);
    return NextResponse.json({
      systemPrompt: result.systemPrompt,
      siteName: result.siteName,
      preview: result.preview,
      detectedLanguage: result.detectedLanguage,
    });
  } catch (e) {
    console.error("onboarding/analyze-url", e);
    const message = e instanceof Error ? e.message : "Error al analizar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
