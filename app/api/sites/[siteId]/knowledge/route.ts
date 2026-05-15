import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scrapeUrl } from "@/lib/scraper";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { siteId } = await params;
  const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const entries = await prisma.knowledgeEntry.findMany({
    where: { siteId: site.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, content: true, type: true, sourceUrl: true, createdAt: true },
  });

  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { siteId } = await params;
  const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const count = await prisma.knowledgeEntry.count({ where: { siteId: site.id } });
  const limit = site.plan === "elite" ? 100 : site.plan === "pro" ? 30 : 10;
  if (count >= limit) {
    return NextResponse.json(
      { error: `Límite de ${limit} entradas para el plan ${site.plan}.` },
      { status: 403 },
    );
  }

  const body = (await req.json()) as {
    title?: string;
    content?: string;
    type?: string;
    sourceUrl?: string;
  };

  let title = (body.title ?? "").trim();
  let content = (body.content ?? "").trim();
  const type = body.type ?? "text";
  const sourceUrl = body.sourceUrl?.trim() ?? null;

  // URL type: scrape and extract text
  if (type === "url" && sourceUrl) {
    try {
      const scraped = await scrapeUrl(sourceUrl);
      if (!title) title = scraped.siteName || new URL(sourceUrl).hostname;
      if (!content) content = scraped.systemPrompt.slice(0, 8000);
    } catch {
      return NextResponse.json({ error: "No se pudo obtener contenido de la URL." }, { status: 422 });
    }
  }

  if (!title || !content) {
    return NextResponse.json({ error: "Título y contenido son requeridos." }, { status: 400 });
  }

  try {
    const entry = await prisma.knowledgeEntry.create({
      data: { siteId: site.id, title, content: content.slice(0, 12000), type, sourceUrl },
    });
    return NextResponse.json({ entry });
  } catch (e) {
    console.error("POST /api/sites/[siteId]/knowledge", e);
    return NextResponse.json({ error: "Error al guardar la entrada." }, { status: 500 });
  }
}
