import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string; visitorId: string; noteId: string }> },
) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { siteId: publicSiteId, visitorId, noteId } = await params;

    // Verify ownership chain: note → profile → site → user
    const site = await prisma.site.findFirst({ where: { siteId: publicSiteId, userId: dbUser.id } });
    if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const note = await prisma.visitorNote.findUnique({
      where: { id: noteId },
      include: { profile: { select: { visitorId: true, siteId: true } } },
    });
    if (!note || note.profile.siteId !== site.id || note.profile.visitorId !== visitorId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.visitorNote.delete({ where: { id: noteId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
