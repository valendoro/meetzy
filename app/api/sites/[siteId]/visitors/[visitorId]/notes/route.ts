import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PostSchema = z.object({
  content: z.string().min(1).max(2000),
});

async function getSiteAndProfile(publicSiteId: string, visitorId: string, userId: string) {
  const site = await prisma.site.findFirst({ where: { siteId: publicSiteId, userId } });
  if (!site) return null;
  const profile = await prisma.visitorProfile.findUnique({
    where: { visitorId_siteId: { visitorId, siteId: site.id } },
  });
  return profile ? { site, profile } : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string; visitorId: string }> },
) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { siteId, visitorId } = await params;
    const ctx = await getSiteAndProfile(siteId, visitorId, dbUser.id);
    if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const notes = await prisma.visitorNote.findMany({
      where: { profileId: ctx.profile.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notes });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; visitorId: string }> },
) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { siteId, visitorId } = await params;
    const ctx = await getSiteAndProfile(siteId, visitorId, dbUser.id);
    if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const parsed = PostSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const note = await prisma.visitorNote.create({
      data: { profileId: ctx.profile.id, content: parsed.data.content },
    });

    return NextResponse.json({ note });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
