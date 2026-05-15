import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { siteId: publicSiteId } = await params;
    const site = await prisma.site.findFirst({
      where: { siteId: publicSiteId, userId: dbUser.id },
    });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
    if (!site.webhookUrl) return NextResponse.json({ error: "No webhook URL configured" }, { status: 400 });

    const payload = {
      event: "test",
      siteId: publicSiteId,
      siteName: site.name,
      agentName: site.agentName,
      conversationId: "test-conversation-id",
      visitorId: "test-visitor-id",
      visitorName: "Visitante de prueba",
      visitorEmail: "test@example.com",
      visitorCompany: "Empresa Test",
      country: "Argentina",
      source: "direct",
      intentScore: 85,
      intentLabel: "hot_lead",
      lastMessage: "¿Cuánto cuesta el plan Pro?",
      agentResponse: "El plan Pro cuesta $49/mes. ¿Querés que te mande más info?",
      timestamp: new Date().toISOString(),
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard/${publicSiteId}/visitors`,
    };

    let status: number;
    let responseBody: string;

    try {
      const res = await fetch(site.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Meetzy-Event": "test",
          "X-Meetzy-Site": publicSiteId,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });
      status = res.status;
      responseBody = await res.text().catch(() => "");
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err instanceof Error ? err.message : "Network error" },
        { status: 200 },
      );
    }

    return NextResponse.json({
      success: status >= 200 && status < 300,
      status,
      responseBody: responseBody.slice(0, 500),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
