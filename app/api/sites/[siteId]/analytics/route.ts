import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;

    const site = await prisma.site.findFirst({
      where: { siteId, userId: session.user.id },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const now = new Date();
    const day1ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const day2ago = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const day7ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const day30ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [today, week, month, total, recentMessages, conversations] = await Promise.all([
      prisma.conversation.count({ where: { siteId: site.id, createdAt: { gte: day1ago } } }),
      prisma.conversation.count({ where: { siteId: site.id, createdAt: { gte: day7ago } } }),
      prisma.conversation.count({ where: { siteId: site.id, createdAt: { gte: day30ago } } }),
      prisma.conversation.count({ where: { siteId: site.id } }),
      prisma.message.findMany({
        where: { conversation: { siteId: site.id }, role: "user", createdAt: { gte: day30ago } },
        select: { content: true },
        take: 100,
        orderBy: { createdAt: "desc" },
      }),
      prisma.conversation.findMany({
        where: { siteId: site.id, createdAt: { gte: day30ago } },
        select: { intentScore: true },
      }),
    ]);

    // Average messages per conversation
    const allConvIds = await prisma.conversation.findMany({
      where: { siteId: site.id },
      select: { id: true },
      take: 200,
    });
    let avgMessages = 0;
    if (allConvIds.length > 0) {
      const msgCounts = await prisma.message.groupBy({
        by: ["conversationId"],
        where: { conversationId: { in: allConvIds.map((c) => c.id) } },
        _count: true,
      });
      if (msgCounts.length > 0) {
        avgMessages =
          Math.round(
            (msgCounts.reduce((s, g) => s + g._count, 0) / msgCounts.length) * 10
          ) / 10;
      }
    }

    // Intent distribution
    const intentDistribution = {
      high: conversations.filter((c) => c.intentScore >= 0.6).length,
      medium: conversations.filter((c) => c.intentScore >= 0.2 && c.intentScore < 0.6).length,
      low: conversations.filter((c) => c.intentScore < 0.2).length,
    };

    // Hot leads — high intent conversations in last 48h
    const hotLeadConvs = await prisma.conversation.findMany({
      where: {
        siteId: site.id,
        intentScore: { gte: 0.4 },
        createdAt: { gte: day2ago },
      },
      orderBy: { intentScore: "desc" },
      take: 5,
      include: {
        messages: {
          where: { role: "user" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, intentSignals: true },
        },
      },
    });

    const hotLeads = hotLeadConvs.map((conv) => ({
      visitorId: conv.visitorId,
      intentScore: conv.intentScore,
      lastMessage: conv.messages[0]?.content ?? "",
      signals: (conv.messages[0]?.intentSignals as string[] | null) ?? [],
      conversationId: conv.id,
      createdAt: conv.createdAt.toISOString(),
    }));

    // Top questions via GPT
    let topQuestions: string[] = [];
    if (recentMessages.length > 0) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Analyze these user messages and return the top 5 most common topics/questions as a JSON object with key 'questions' containing an array of strings. Be concise (max 60 chars each). Return only valid JSON.",
            },
            {
              role: "user",
              content: recentMessages.slice(0, 80).map((m) => m.content).join("\n"),
            },
          ],
          response_format: { type: "json_object" },
          max_tokens: 200,
        });
        const result = JSON.parse(completion.choices[0].message.content ?? "{}") as {
          questions?: string[];
          topics?: string[];
        };
        topQuestions = result.questions ?? result.topics ?? [];
      } catch {
        topQuestions = [];
      }
    }

    return NextResponse.json({
      today,
      week,
      month,
      total,
      avgMessages,
      topQuestions,
      hotLeads,
      intentDistribution,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
