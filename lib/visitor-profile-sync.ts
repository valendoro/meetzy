import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function inferTrafficSource(
  referrer: string | null | undefined,
  utmSource: string | null | undefined,
): string {
  if (utmSource?.trim()) return utmSource.trim().toLowerCase();
  if (!referrer?.trim()) return "direct";
  try {
    const h = new URL(referrer).hostname.replace(/^www\./, "");
    if (h.includes("google")) return "google";
    if (h.includes("instagram")) return "instagram";
    if (h.includes("facebook") || h === "fb.com" || h.includes("fb.watch")) return "facebook";
    if (h.includes("linkedin")) return "linkedin";
    if (h.includes("twitter") || h.includes("t.co") || h === "x.com") return "twitter";
    return "referral";
  } catch {
    return "direct";
  }
}

export async function upsertVisitorProfile(args: {
  internalSiteId: string;
  visitorId: string;
  email: string | null;
  name: string | null;
  company: string | null;
  intentScore: number;
  intentLabel: string;
  demoBooked: boolean;
  sessionDurationAdded: number;
  messageCountDelta: number;
  countAsNewVisit: boolean;
  country: string | null;
  source: string | null;
}): Promise<void> {
  const existing = await prisma.visitorProfile.findUnique({
    where: { visitorId_siteId: { visitorId: args.visitorId, siteId: args.internalSiteId } },
  });

  const email = args.email ?? existing?.email ?? null;
  const name = args.name ?? existing?.name ?? null;
  const company = args.company ?? existing?.company ?? null;
  const maxScore = Math.max(existing?.maxIntentScore ?? 0, args.intentScore);
  const maxLabel =
    args.intentScore >= (existing?.maxIntentScore ?? 0)
      ? args.intentLabel
      : (existing?.maxIntentLabel ?? "exploring");

  const updateData: Prisma.VisitorProfileUpdateInput = {
    email: email ?? undefined,
    name: name ?? undefined,
    company: company ?? undefined,
    maxIntentScore: maxScore,
    maxIntentLabel: maxLabel,
    demoBooked: args.demoBooked ? true : undefined,
    lastSeenAt: new Date(),
    country: args.country ?? existing?.country ?? undefined,
    topSource: args.source ?? existing?.topSource ?? undefined,
  };

  if (args.messageCountDelta > 0) {
    updateData.totalMessages = { increment: args.messageCountDelta };
  }
  if (args.sessionDurationAdded > 0) {
    updateData.totalTime = { increment: args.sessionDurationAdded };
  }
  if (args.countAsNewVisit) {
    updateData.totalVisits = { increment: 1 };
  }

  if (!existing) {
    // Race-condition safe: if two tabs create simultaneously, the second will hit
    // the unique constraint — catch and fall through to update instead.
    try {
      await prisma.visitorProfile.create({
        data: {
          visitorId: args.visitorId,
          siteId: args.internalSiteId,
          email,
          name,
          company,
          totalVisits: 1,
          totalMessages: Math.max(0, args.messageCountDelta),
          totalTime: Math.max(0, args.sessionDurationAdded),
          maxIntentScore: args.intentScore,
          maxIntentLabel: args.intentLabel,
          demoBooked: args.demoBooked,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
          country: args.country,
          topSource: args.source,
        },
      });
      return;
    } catch {
      // Unique constraint violation → fall through to update below
    }
  }

  await prisma.visitorProfile.update({
    where: { visitorId_siteId: { visitorId: args.visitorId, siteId: args.internalSiteId } },
    data: updateData,
  });
}
