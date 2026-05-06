import { NextRequest, NextResponse } from "next/server";
import { scrapeRatelimit } from "@/lib/redis";
import { scrapeUrl } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    const { success } = await scrapeRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intentá de nuevo más tarde." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as { url?: string };
    if (!body.url) {
      return NextResponse.json({ error: "URL requerida" }, { status: 400 });
    }

    let url = body.url.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }

    const result = await scrapeUrl(url);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Scrape error:", error);
    const message =
      error instanceof Error ? error.message : "Error al analizar el sitio";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
