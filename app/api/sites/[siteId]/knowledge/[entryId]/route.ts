import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; entryId: string }> },
) {
  const dbUser = await getDbUser();
  if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { siteId, entryId } = await params;
  const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json()) as { title?: string; content?: string };
  const entry = await prisma.knowledgeEntry.updateMany({
    where: { id: entryId, siteId: site.id },
    data: {
      ...(body.title !== undefined ? { title: body.title.trim() } : {}),
      ...(body.content !== undefined ? { content: body.content.trim().slice(0, 12000) } : {}),
    },
  });
  if (!entry.count) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string; entryId: string }> },
) {
  const dbUser = await getDbUser();
  if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { siteId, entryId } = await params;
  const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.knowledgeEntry.deleteMany({ where: { id: entryId, siteId: site.id } });
  return NextResponse.json({ ok: true });
}
