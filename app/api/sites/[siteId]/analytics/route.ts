import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, format, eachDayOfInterval } from "date-fns";
import type { Prisma } from "@prisma/client";
import { getCachedJson, topQuestionsCacheKey } from "@/lib/analytics-cache";
import { countryFlagEmoji } from "@/lib/country-flag";

type Range = "today" | "7d" | "30d" | "all";

function parseRange(r: string | null): { from: Date; to: Date; prevFrom: Date; prevTo: Date } {
  const to = new Date();
  let from: Date;
  if (r === "today") {
    from = startOfDay(to);
  } else if (r === "30d") {
    from = subDays(to, 30);
  } else if (r === "all") {
    from = new Date(0);
  } else {
    from = subDays(to, 7);
  }
  const span = Math.max(1, to.getTime() - from.getTime());
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - span);
  return { from, to, prevFrom, prevTo };
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

type ConvRow = {
  id: string;
  createdAt: Date;
  intentScore: number;
  intentLabel: string | null;
  sessionDuration: number;
  pagesVisited: string[];
  country: string | null;
  source: string | null;
  visitorId: string;
};

function aggregate(
  rows: ConvRow[],
): {
  total: number;
  avgDuration: number;
  avgPages: number;
  hotLeads: number;
  intentDistribution: Record<string, number>;
  byDay: Map<string, number>;
  heatmap: number[][];
  countries: Map<string, number>;
  sources: Map<string, number>;
} {
  const intentDistribution: Record<string, number> = {
    exploring: 0,
    interested: 0,
    evaluating: 0,
    ready_to_buy: 0,
    hot_lead: 0,
  };
  const byDay = new Map<string, number>();
  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0) as number[]);
  const countries = new Map<string, number>();
  const sources = new Map<string, number>();
  let durSum = 0;
  let pageSum = 0;
  let hotLeads = 0;

  for (const c of rows) {
    const label =
      c.intentLabel && c.intentLabel in intentDistribution ? c.intentLabel : "exploring";
    intentDistribution[label] = (intentDistribution[label] ?? 0) + 1;
    if (c.intentScore > 65 || label === "ready_to_buy" || label === "hot_lead") hotLeads++;

    const dk = format(c.createdAt, "yyyy-MM-dd");
    byDay.set(dk, (byDay.get(dk) ?? 0) + 1);

    const d = new Date(c.createdAt);
    heatmap[d.getDay()][d.getHours()]++;

    if (c.country) countries.set(c.country, (countries.get(c.country) ?? 0) + 1);
    const src = c.source ?? "direct";
    sources.set(src, (sources.get(src) ?? 0) + 1);

    durSum += c.sessionDuration || 0;
    pageSum += c.pagesVisited?.length ?? 0;
  }

  const n = rows.length || 1;
  return {
    total: rows.length,
    avgDuration: Math.round(durSum / n),
    avgPages: Math.round((pageSum / n) * 10) / 10,
    hotLeads,
    intentDistribution,
    byDay,
    heatmap,
    countries,
    sources,
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { siteId } = await params;
    const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const range = (req.nextUrl.searchParams.get("range") ?? "7d") as Range;
    const { from, to, prevFrom, prevTo } = parseRange(range === "today" || range === "7d" || range === "30d" || range === "all" ? range : "7d");

    const select = {
      id: true,
      createdAt: true,
      intentScore: true,
      intentLabel: true,
      sessionDuration: true,
      pagesVisited: true,
      country: true,
      source: true,
      visitorId: true,
    } satisfies Prisma.ConversationSelect;

    const [curr, prev] = await Promise.all([
      prisma.conversation.findMany({
        where: { siteId: site.id, createdAt: { gte: from, lte: to } },
        orderBy: { createdAt: "desc" },
        take: 10000,
        select,
      }),
      prisma.conversation.findMany({
        where: { siteId: site.id, createdAt: { gte: prevFrom, lte: prevTo } },
        orderBy: { createdAt: "desc" },
        take: 10000,
        select,
      }),
    ]);

    const a = aggregate(curr as ConvRow[]);
    const ap = aggregate(prev as ConvRow[]);

    const chartFrom = range === "all" ? subDays(to, 89) : from;
    const byDayArr = eachDayOfInterval({ start: chartFrom, end: to }).map(
      (d) => ({
        date: format(d, "yyyy-MM-dd"),
        count: a.byDay.get(format(d, "yyyy-MM-dd")) ?? 0,
      }),
    );

    const funnelRows = await prisma.visitorProfile.groupBy({
      by: ["maxIntentLabel"],
      where: { siteId: site.id },
      _count: { id: true },
    });
    const funnel: {
      exploring: number;
      interested: number;
      evaluating: number;
      ready_to_buy: number;
      hot_lead: number;
    } = {
      exploring: 0,
      interested: 0,
      evaluating: 0,
      ready_to_buy: 0,
      hot_lead: 0,
    };
    for (const r of funnelRows) {
      const k = r.maxIntentLabel as keyof typeof funnel;
      if (k in funnel) funnel[k] += r._count.id;
      else funnel.exploring += r._count.id;
    }

    const cachedQuestions = await getCachedJson<{ question: string; count: number }[]>(
      topQuestionsCacheKey(site.id),
    );
    const topQuestions = (cachedQuestions ?? []).slice(0, 10);

    const countries = [...a.countries.entries()]
      .sort((x, y) => y[1] - x[1])
      .slice(0, 5)
      .map(([country, count]) => ({ country, count, flag: countryFlagEmoji(country) }));

    const sources = [...a.sources.entries()]
      .sort((x, y) => y[1] - x[1])
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));

    const trafficDetail = [...a.sources.entries()].map(([source, sessions]) => {
      const subset = (curr as ConvRow[]).filter((c) => (c.source ?? "direct") === source);
      const avgIntent =
        subset.length === 0 ? 0 : Math.round(subset.reduce((s, c) => s + c.intentScore, 0) / subset.length);
      const avgDur =
        subset.length === 0 ? 0 : Math.round(subset.reduce((s, c) => s + (c.sessionDuration || 0), 0) / subset.length);
      return { source, sessions, avgIntent, avgDuration: avgDur };
    });

    return NextResponse.json({
      range,
      sessions: {
        total: a.total,
        change: pctChange(a.total, ap.total),
        byDay: byDayArr,
      },
      avgDuration: { value: a.avgDuration, change: pctChange(a.avgDuration, ap.avgDuration) },
      avgPagesVisited: { value: a.avgPages, change: pctChange(a.avgPages, ap.avgPages) },
      hotLeads: { total: a.hotLeads, change: pctChange(a.hotLeads, ap.hotLeads) },
      intentDistribution: a.intentDistribution,
      countries,
      sources,
      hourlyHeatmap: a.heatmap,
      funnel,
      trafficSources: trafficDetail.sort((x, y) => y.sessions - x.sessions),
      topQuestions,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
