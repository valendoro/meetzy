import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOpenAI, isOpenAIConfigured } from "@/lib/openai";
import { getCachedJson, setCachedJson, topQuestionsCacheKey, TTL_TOP_QUESTIONS_SEC } from "@/lib/analytics-cache";
import { z } from "zod";

const ClusterSchema = z.object({
  clusters: z.array(
    z.object({
      question: z.string(),
      count: z.number().int().nonnegative(),
    }),
  ),
});

export async function POST(_req: Request, { params }: { params: Promise<{ siteId: string }> }) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { siteId: publicSiteId } = await params;
    const site = await prisma.site.findFirst({
      where: { siteId: publicSiteId, userId: dbUser.id },
    });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const key = topQuestionsCacheKey(site.id);
    const cached = await getCachedJson<{ question: string; count: number }[]>(key);
    if (cached?.length) {
      return NextResponse.json({ topQuestions: cached.slice(0, 10), cached: true });
    }

    if (!isOpenAIConfigured()) {
      return NextResponse.json({ error: "OpenAI not configured", topQuestions: [] }, { status: 503 });
    }

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const messages = await prisma.message.findMany({
      where: {
        role: "user",
        conversation: { siteId: site.id, createdAt: { gte: since } },
      },
      select: { content: true },
      take: 400,
      orderBy: { createdAt: "desc" },
    });

    if (messages.length === 0) {
      await setCachedJson(key, [], TTL_TOP_QUESTIONS_SEC);
      return NextResponse.json({ topQuestions: [], cached: false });
    }

    const contents = messages.map((m) => m.content.trim()).filter(Boolean);
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Group similar visitor questions into clusters. Output JSON: { \"clusters\": [ { \"question\": \"short representative question in Spanish\", \"count\": number } ] }. " +
            "Sort by count descending. Max 10 clusters. Estimate count from how many raw lines match that theme.",
        },
        {
          role: "user",
          content: JSON.stringify(contents.slice(0, 300)),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: z.infer<typeof ClusterSchema>;
    try {
      const json = JSON.parse(raw) as unknown;
      const zod = ClusterSchema.safeParse(json);
      if (!zod.success) {
        return NextResponse.json({ topQuestions: [], error: "Parse error" }, { status: 200 });
      }
      parsed = zod.data;
    } catch {
      return NextResponse.json({ topQuestions: [] }, { status: 200 });
    }

    const topQuestions = [...parsed.clusters]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((c) => ({ question: c.question, count: c.count }));

    await setCachedJson(key, topQuestions, TTL_TOP_QUESTIONS_SEC);
    return NextResponse.json({ topQuestions, cached: false });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
