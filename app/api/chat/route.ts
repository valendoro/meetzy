import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isOpenAIConfigured, openai, UI_FUNCTIONS } from "@/lib/openai";
import { chatRatelimit } from "@/lib/redis";
import type OpenAI from "openai";
import type { Prisma } from "@prisma/client";
import { computeFullIntent, scoreFromChatMessage, type VisitorContextLike } from "@/lib/intent-scorer";
import { enrichFromMessage, type ExtractedVisitorHints } from "@/lib/visitor-enrichment";
import { inferTrafficSource, upsertVisitorProfile } from "@/lib/visitor-profile-sync";
import { clientIpFromRequest, lookupGeo } from "@/lib/geoip";

interface VisitorContextPayload {
  timeOnSite?: number;
  currentSection?: string;
  sectionsViewed?: Record<string, { time: number; revisits: number }>;
  referrer?: string;
  searchQuery?: string | null;
  localHour?: number;
  isReturnVisitor?: boolean;
  inferredIntent?: string;
  scrollDepth?: number;
}

interface ChatRequestBody {
  siteId: string;
  message: string;
  conversationId?: string;
  visitorId: string;
  plan?: string;
  currentSection?: string;
  visitorContext?: VisitorContextPayload;
  visitorContextPrompt?: string;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}

function scheduleGeoEnrichment(req: NextRequest, conversationId: string): void {
  void (async () => {
    try {
      const ip = clientIpFromRequest(req.headers);
      if (!ip) return;
      const g = lookupGeo(ip);
      if (!g?.country && !g?.city) return;
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          country: g.country ?? undefined,
          city: g.city ?? undefined,
        },
      });
    } catch {
      /* never block */
    }
  })();
}

async function syncConversationAfterUserMessage(args: {
  conversationId: string;
  internalSiteId: string;
  visitorId: string;
  visitorContext?: VisitorContextPayload;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}): Promise<{ intentScore: number; intentLabel: string }> {
  const conv = await prisma.conversation.findUnique({
    where: { id: args.conversationId },
    include: { site: { include: { user: { select: { email: true, name: true } } } } },
  });
  if (!conv) {
    return { intentScore: 0, intentLabel: "exploring" };
  }
  const prevIntentLabel = conv.intentLabel;

  const userRows = await prisma.message.findMany({
    where: { conversationId: conv.id, role: "user" },
    orderBy: { createdAt: "asc" },
    select: { content: true },
  });
  const texts = userRows.map((r) => r.content);

  const prevConvCount = await prisma.conversation.count({
    where: { siteId: args.internalSiteId, visitorId: args.visitorId, id: { not: conv.id } },
  });
  const isReturnVisitor = prevConvCount > 0 || !!args.visitorContext?.isReturnVisitor;

  const mergedSections = args.visitorContext?.sectionsViewed
    ? {
        ...((conv.sectionsViewed as Record<string, { time: number; revisits: number }> | null) ?? {}),
        ...args.visitorContext.sectionsViewed,
      }
    : (conv.sectionsViewed as VisitorContextLike["sectionsViewed"] | undefined);

  const ctx: VisitorContextLike = {
    timeOnSite: args.visitorContext?.timeOnSite ?? conv.sessionDuration,
    sectionsViewed: mergedSections,
    scrollDepth: args.visitorContext?.scrollDepth ?? conv.scrollDepth,
    isReturnVisitor,
  };

  const { intentScore, intentLabel, intentSignalsLog } = computeFullIntent(texts, ctx);

  let hints: ExtractedVisitorHints = {
    email: conv.visitorEmail ?? undefined,
    name: conv.visitorName ?? undefined,
    company: conv.visitorCompany ?? undefined,
  };
  for (const t of texts) {
    hints = enrichFromMessage(t, hints);
  }

  const source = inferTrafficSource(
    args.referrer ?? args.visitorContext?.referrer ?? conv.referrer,
    args.utmSource ?? conv.utmSource,
  );

  const updated = await prisma.conversation.update({
    where: { id: conv.id },
    data: {
      intentScore,
      intentLabel,
      intentSignalsLog: intentSignalsLog as unknown as Prisma.InputJsonValue,
      source,
      ...(hints.email ? { visitorEmail: hints.email } : {}),
      ...(hints.name ? { visitorName: hints.name } : {}),
      ...(hints.company ? { visitorCompany: hints.company } : {}),
      ...(mergedSections && Object.keys(mergedSections).length > 0
        ? { sectionsViewed: mergedSections as unknown as Prisma.InputJsonValue }
        : {}),
      ...(args.visitorContext?.scrollDepth != null ? { scrollDepth: args.visitorContext.scrollDepth } : {}),
      ...(args.visitorContext?.timeOnSite != null ? { sessionDuration: args.visitorContext.timeOnSite } : {}),
      ...((args.referrer ?? args.visitorContext?.referrer) != null &&
      (args.referrer ?? args.visitorContext?.referrer) !== ""
        ? { referrer: args.referrer ?? args.visitorContext?.referrer ?? undefined }
        : {}),
      ...(args.utmSource ? { utmSource: args.utmSource } : {}),
      ...(args.utmMedium ? { utmMedium: args.utmMedium } : {}),
      ...(args.utmCampaign ? { utmCampaign: args.utmCampaign } : {}),
      ...(args.visitorContext?.searchQuery !== undefined
        ? { searchQuery: args.visitorContext.searchQuery || null }
        : {}),
    },
  });

  await upsertVisitorProfile({
    internalSiteId: args.internalSiteId,
    visitorId: args.visitorId,
    email: hints.email ?? updated.visitorEmail,
    name: hints.name ?? updated.visitorName,
    company: hints.company ?? updated.visitorCompany,
    intentScore,
    intentLabel,
    demoBooked: updated.demoBooked,
    sessionDurationAdded: 0,
    messageCountDelta: 1,
    countAsNewVisit: false,
    country: updated.country,
    source,
  });

  return { intentScore, intentLabel };
}

interface UIComponent {
  type: string;
  data: Record<string, unknown>;
}

function buildSystemPrompt(
  site: { systemPrompt: string; agentName: string; agentRole: string; agentPersonality: string; language: string },
  currentSection?: string,
  visitorContext?: VisitorContextPayload,
  legacyPrompt?: string,
  knowledgeEntries?: { title: string; content: string }[]
): string {
  let base = site.systemPrompt;

  // Replace template variables if present (Milo landing pattern)
  if (base.includes("{{currentSection}}") || base.includes("{{visitorContext}}")) {
    const ctxStr = visitorContext
      ? `tiempo en sitio: ${visitorContext.timeOnSite ?? 0}s, sección actual: ${currentSection ?? "desconocida"}, ` +
        `intención: ${visitorContext.inferredIntent ?? "explorando"}, ` +
        `visita anterior: ${visitorContext.isReturnVisitor ? "sí" : "no"}, ` +
        `hora local: ${visitorContext.localHour ?? new Date().getHours()}hs, ` +
        `origen: ${visitorContext.referrer || "directo"}, ` +
        `secciones vistas: ${JSON.stringify(visitorContext.sectionsViewed ?? {})}`
      : "no disponible";

    base = base
      .replace(/\{\{currentSection\}\}/g, currentSection ?? "desconocida")
      .replace(/\{\{visitorContext\}\}/g, ctxStr);
  } else {
    // Standard agent prompt
    base = `${base}\n\nTu nombre es ${site.agentName}. Tu rol es ${site.agentRole}. Tu personalidad es ${site.agentPersonality}.
Respondé en ${site.language === "es" ? "español rioplatense (vos, che)" : site.language === "en" ? "inglés" : site.language}.
Sé conciso y útil. Máximo 3 líneas por respuesta.`;

    if (currentSection) {
      base += `\n\nEl visitante está actualmente en la sección: "${currentSection}".`;
    }

    if (legacyPrompt) {
      base += `\n\n${legacyPrompt}`;
    } else if (visitorContext) {
      base += `\n\nCONTEXTO DEL VISITANTE: ${JSON.stringify(visitorContext)}`;
    }
  }

  // Inject knowledge base entries
  if (knowledgeEntries && knowledgeEntries.length > 0) {
    const kb = knowledgeEntries
      .map((e) => `### ${e.title}\n${e.content}`)
      .join("\n\n---\n\n");
    base += `\n\n== BASE DE CONOCIMIENTO ==\nUsá esta información para responder con precisión. Si el usuario pregunta algo cubierto acá, priorizá esta info.\n\n${kb}\n== FIN BASE DE CONOCIMIENTO ==`;
  }

  return base;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const {
      siteId,
      message,
      conversationId,
      visitorId,
      visitorContextPrompt,
      currentSection,
      visitorContext,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    if (!siteId || !message || !visitorId) {
      return NextResponse.json(
        { error: "siteId, message, and visitorId are required" },
        { status: 400 }
      );
    }

    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        {
          error:
            "OpenAI no está configurado. Definí OPENAI_API_KEY en el entorno del servidor y volvé a desplegar.",
        },
        { status: 503 }
      );
    }

    const { success } = await chatRatelimit.limit(
      `${siteId}:${visitorId}`
    );
    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const site = await prisma.site.findUnique({
      where: { siteId },
    });

    if (!site || !site.isActive) {
      return NextResponse.json(
        { error: "Site not found or inactive" },
        { status: 404 }
      );
    }

    let conversation = conversationId
      ? await prisma.conversation.findFirst({
          where: { id: conversationId, siteId: site.id, visitorId },
        })
      : null;

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          siteId: site.id,
          visitorId,
          referrer: (referrer ?? visitorContext?.referrer) || undefined,
          searchQuery: visitorContext?.searchQuery || undefined,
          utmSource: utmSource || undefined,
          utmMedium: utmMedium || undefined,
          utmCampaign: utmCampaign || undefined,
          source: inferTrafficSource(referrer ?? visitorContext?.referrer, utmSource),
        },
      });
      scheduleGeoEnrichment(req, conversation.id);
      await upsertVisitorProfile({
        internalSiteId: site.id,
        visitorId,
        email: null,
        name: null,
        company: null,
        intentScore: 0,
        intentLabel: "exploring",
        demoBooked: false,
        sessionDurationAdded: 0,
        messageCountDelta: 0,
        countAsNewVisit: true,
        country: null,
        source: inferTrafficSource(referrer ?? visitorContext?.referrer, utmSource),
      });
    }

    const previousMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const knowledgeEntries = await prisma.knowledgeEntry.findMany({
      where: { siteId: site.id },
      select: { title: true, content: true },
      take: 20,
    });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: buildSystemPrompt(site, currentSection, visitorContext, visitorContextPrompt, knowledgeEntries),
      },
      ...previousMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const isPro = site.plan === "pro" || site.plan === "elite";
    const tools = isPro ? UI_FUNCTIONS : undefined;

    const { points: msgIntentPoints, signals: msgSigs } = scoreFromChatMessage(message);

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools,
      tool_choice: tools ? "auto" : undefined,
      stream: true,
      max_tokens: 800,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    let fullContent = "";
    const uiComponents: UIComponent[] = [];
    let currentToolName = "";
    let currentToolArgs = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;

            if (delta?.content) {
              fullContent += delta.content;
              const data = JSON.stringify({ type: "text", content: delta.content });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }

            if (delta?.tool_calls) {
              for (const toolCall of delta.tool_calls) {
                if (toolCall.function?.name) {
                  currentToolName = toolCall.function.name;
                  currentToolArgs = "";
                }
                if (toolCall.function?.arguments) {
                  currentToolArgs += toolCall.function.arguments;
                }
              }
            }

            const finishReason = chunk.choices[0]?.finish_reason;
            if (finishReason === "tool_calls" && currentToolName) {
              try {
                const parsedArgs = JSON.parse(currentToolArgs) as Record<string, unknown>;
                const uiComp: UIComponent = {
                  type: currentToolName.replace("generate_ui_", ""),
                  data: parsedArgs,
                };
                uiComponents.push(uiComp);
                const uiData = JSON.stringify({ type: "ui_component", component: uiComp });
                controller.enqueue(encoder.encode(`data: ${uiData}\n\n`));
              } catch {
                // malformed tool call args, skip
              }
              currentToolName = "";
              currentToolArgs = "";
            }

            if (finishReason === "stop" || finishReason === "tool_calls") {
              let finalIntent = { intentScore: 0, intentLabel: "exploring" };
              try {
                await prisma.$transaction([
                  prisma.message.create({
                    data: {
                      conversationId: conversation!.id,
                      role: "user",
                      content: message,
                      intentScore: msgIntentPoints,
                      intentSignals:
                        msgSigs.length > 0 ? (msgSigs as unknown as Prisma.InputJsonValue) : undefined,
                    },
                  }),
                  prisma.message.create({
                    data: {
                      conversationId: conversation!.id,
                      role: "assistant",
                      content: fullContent || "[UI Component]",
                      uiComponents:
                        uiComponents.length > 0
                          ? (uiComponents as unknown as Prisma.JsonArray)
                          : undefined,
                    },
                  }),
                ]);

                finalIntent = await syncConversationAfterUserMessage({
                  conversationId: conversation!.id,
                  internalSiteId: site.id,
                  visitorId,
                  visitorContext,
                  referrer: referrer ?? visitorContext?.referrer,
                  utmSource,
                  utmMedium,
                  utmCampaign,
                });
              } catch (err) {
                console.error("Chat persist error:", err);
              }

              const doneData = JSON.stringify({
                type: "done",
                conversationId: conversation!.id,
                intentScore: finalIntent.intentScore,
                intentLabel: finalIntent.intentLabel,
              });
              controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));

              // Fire webhook only on high-intent events (hot_lead or ready_to_buy)
              if (
                site.webhookUrl &&
                (finalIntent.intentLabel === "hot_lead" || finalIntent.intentLabel === "ready_to_buy")
              ) {
                const conv = await prisma.conversation.findUnique({
                  where: { id: conversation!.id },
                  select: { visitorName: true, visitorEmail: true, visitorCompany: true, country: true, source: true },
                });
                fetch(site.webhookUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    event: finalIntent.intentLabel,
                    siteId,
                    siteName: site.agentName,
                    conversationId: conversation!.id,
                    visitorId,
                    visitorName: conv?.visitorName ?? null,
                    visitorEmail: conv?.visitorEmail ?? null,
                    visitorCompany: conv?.visitorCompany ?? null,
                    country: conv?.country ?? null,
                    source: conv?.source ?? null,
                    intentScore: finalIntent.intentScore,
                    intentLabel: finalIntent.intentLabel,
                    lastMessage: message,
                    agentResponse: fullContent,
                    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard/${siteId}/visitors`,
                  }),
                }).catch(() => {});
              }

              break;
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "X-Conversation-Id": conversation.id,
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
