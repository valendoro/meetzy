import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizeUrl(raw: string): string {
  let u = raw.trim();
  if (!u.startsWith("http://") && !u.startsWith("https://")) u = `https://${u}`;
  return u;
}

export async function GET(_req: Request, { params }: { params: Promise<{ siteId: string }> }) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { siteId: publicId } = await params;
    const site = await prisma.site.findFirst({
      where: { siteId: publicId, userId: dbUser.id },
      select: { url: true, siteId: true },
    });
    if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const target = normalizeUrl(site.url);
    const res = await fetch(target, {
      headers: { "User-Agent": "MeetzyOnboardingVerify/1.0 (+https://meetzy.ai)" },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    }).catch(() => null);

    if (!res || !res.ok) {
      return NextResponse.json({ detected: false });
    }

    const html = await res.text();
    const detected =
      html.includes("MEETZYCONFIG") ||
      (html.includes("meetzy") && html.includes("widget.js")) ||
      (html.includes("widget.js") && html.includes(site.siteId));

    return NextResponse.json({ detected });
  } catch {
    return NextResponse.json({ detected: false });
  }
}
