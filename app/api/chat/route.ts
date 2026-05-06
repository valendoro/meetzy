import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openai, UI_FUNCTIONS } from "@/lib/openai";
import { chatRatelimit } from "@/lib/redis";
import type OpenAI from "openai";

interface ChatRequestBody {
  siteId: string;
  message: string;
  conversationId?: string;
  visitorId: string;
  plan?: string;
  visitorContext?: Record<string, unknown>;
  visitorContextPrompt?: string;
}

interface UIComponent {
  type: string;
  data: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const { siteId, message, conversationId, visitorId, visitorContextPrompt } = body;

    if (!siteId || !message || !visitorId) {
      return NextResponse.json(
        { error: "siteId, message, and visitorId are required" },
        { status: 400 }
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
      ? await prisma.conversation.findUnique({ where: { id: conversationId } })
      : null;

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { siteId: site.id, visitorId },
      });
    }

    const previousMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `${site.systemPrompt}

Tu nombre es ${site.agentName}. Tu rol es ${site.agentRole}. Tu personalidad es ${site.agentPersonality}.
Respondé en ${site.language === "es" ? "español rioplatense (vos, che)" : site.language === "en" ? "inglés" : site.language}.
Sé conciso y útil. Representás esta marca.
Cuando sea relevante, usá function calling para generar UI dinámica (cards, galerías, precios, contacto).${
  visitorContextPrompt ? `\n\n${visitorContextPrompt}` : ""
}`,
      },
      ...previousMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const isPro = site.plan === "pro" || site.plan === "elite";
    const tools = isPro ? UI_FUNCTIONS : undefined;

    // Intent signals to watch for
    const INTENT_SIGNALS = [
      "precio", "cuánto cuesta", "plan", "contratar", "empezar", "comprar",
      "agendar", "llamada", "reunión", "demo", "trial", "prueba", "cotización",
      "presupuesto", "tarjeta", "factura", "suscripción", "pagar",
      "price", "cost", "buy", "purchase", "subscribe", "book", "schedule",
    ];
    const lowerMsg = message.toLowerCase();
    const matchedSignals = INTENT_SIGNALS.filter((s) => lowerMsg.includes(s));
    const intentScore = Math.min(matchedSignals.length / 3, 1);

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
              const doneData = JSON.stringify({
                type: "done",
                conversationId: conversation!.id,
                intentScore,
                intentSignals: matchedSignals,
              });
              controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));

              prisma.$transaction([
                prisma.message.create({
                  data: {
                    conversationId: conversation!.id,
                    role: "user",
                    content: message,
                    intentScore,
                    intentSignals: matchedSignals.length > 0 ? matchedSignals : undefined,
                  },
                }),
                prisma.message.create({
                  data: {
                    conversationId: conversation!.id,
                    role: "assistant",
                    content: fullContent || "[UI Component]",
                    uiComponents: uiComponents.length > 0 ? (uiComponents as unknown as import("@prisma/client").Prisma.JsonArray) : undefined,
                  },
                }),
                ...(intentScore > 0 ? [
                  prisma.conversation.update({
                    where: { id: conversation!.id },
                    data: { intentScore: { increment: intentScore } },
                  }),
                ] : []),
              ]).catch(console.error);

              if (site.webhookUrl && fullContent) {
                fetch(site.webhookUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    event: "message",
                    siteId,
                    conversationId: conversation!.id,
                    visitorId,
                    message,
                    response: fullContent,
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
