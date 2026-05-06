import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOpenAIConfigured, openai } from "@/lib/openai";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { siteId } = await params;
    const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const now = Date.now();
    const [today, week, month, total, recentMsgs, convs] = await Promise.all([
      prisma.conversation.count({ where: { siteId: site.id, createdAt: { gte: new Date(now - 86400000) } } }),
      prisma.conversation.count({ where: { siteId: site.id, createdAt: { gte: new Date(now - 604800000) } } }),
      prisma.conversation.count({ where: { siteId: site.id, createdAt: { gte: new Date(now - 2592000000) } } }),
      prisma.conversation.count({ where: { siteId: site.id } }),
      prisma.message.findMany({ where: { conversation: { siteId: site.id }, role: "user", createdAt: { gte: new Date(now - 2592000000) } }, select: { content: true }, take: 100, orderBy: { createdAt: "desc" } }),
      prisma.conversation.findMany({ where: { siteId: site.id, createdAt: { gte: new Date(now - 2592000000) } }, select: { intentScore: true } }),
    ]);

    const intentDistribution = {
      high: convs.filter(c => c.intentScore >= 0.6).length,
      medium: convs.filter(c => c.intentScore >= 0.2 && c.intentScore < 0.6).length,
      low: convs.filter(c => c.intentScore < 0.2).length,
    };

    const hotLeadConvs = await prisma.conversation.findMany({
      where: { siteId: site.id, intentScore: { gte: 0.4 }, createdAt: { gte: new Date(now - 172800000) } },
      orderBy: { intentScore: "desc" }, take: 5,
      include: { messages: { where: { role: "user" }, orderBy: { createdAt: "desc" }, take: 1, select: { content: true, intentSignals: true } } },
    });

    const hotLeads = hotLeadConvs.map(c => ({
      visitorId: c.visitorId,
      intentScore: c.intentScore,
      lastMessage: c.messages[0]?.content ?? "",
      signals: (c.messages[0]?.intentSignals as string[] | null) ?? [],
      conversationId: c.id,
      createdAt: c.createdAt.toISOString(),
    }));

    let topQuestions: string[] = [];
    if (recentMsgs.length > 0 && isOpenAIConfigured()) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Analyze these user messages and return the top 5 most common topics as a JSON object with key 'questions' containing an array of strings. Max 60 chars each." },
            { role: "user", content: recentMsgs.slice(0, 80).map(m => m.content).join("\n") },
          ],
          response_format: { type: "json_object" },
          max_tokens: 200,
        });
        const r = JSON.parse(completion.choices[0].message.content ?? "{}") as { questions?: string[] };
        topQuestions = r.questions ?? [];
      } catch { topQuestions = []; }
    }

    const allConvIds = await prisma.conversation.findMany({ where: { siteId: site.id }, select: { id: true }, take: 200 });
    let avgMessages = 0;
    if (allConvIds.length > 0) {
      const counts = await prisma.message.groupBy({ by: ["conversationId"], where: { conversationId: { in: allConvIds.map(c => c.id) } }, _count: true });
      if (counts.length > 0) avgMessages = Math.round((counts.reduce((s, g) => s + g._count, 0) / counts.length) * 10) / 10;
    }

    return NextResponse.json({ today, week, month, total, avgMessages, topQuestions, hotLeads, intentDistribution });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}
