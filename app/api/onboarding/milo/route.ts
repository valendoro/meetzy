import { NextResponse } from "next/server";
import { z } from "zod";
import { getDbUser } from "@/lib/auth";
import { getOpenAI, isOpenAIConfigured } from "@/lib/openai";

const MILO_SYSTEM = `Sos Milo, el guía de onboarding de Meetzy. Tu trabajo es hacer que el usuario configure su agente de forma fluida y emocionante.
Sos entusiasta, directo y conciso. Máximo 2 líneas por mensaje.
Hacés una pregunta a la vez. Nunca dos seguidas sin que el usuario responda.
Cuando el usuario termina una elección, la confirmás brevemente y pasás a la siguiente pregunta.
Si el usuario tiene dudas, las resolvés rápido y retomás el onboarding.
Español rioplatense natural. No uses markdown.`;

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .max(24),
  currentStep: z.string().optional(),
  contextHint: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { reply: "No puedo conectar con Milo ahora — seguí con el paso en pantalla. ✨" },
        { status: 200 },
      );
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const { messages, currentStep, contextHint } = parsed.data;
    const openai = getOpenAI();

    const sys =
      MILO_SYSTEM +
      (currentStep ? `\nPaso actual del flujo (referencia): ${currentStep}.` : "") +
      (contextHint ? `\nContexto: ${contextHint}` : "");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.85,
      max_tokens: 220,
      messages: [{ role: "system", content: sys }, ...messages.map((m) => ({ role: m.role, content: m.content }))],
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "Dale, seguimos. 🙌";
    return NextResponse.json({ reply });
  } catch (e) {
    console.error("onboarding/milo", e);
    return NextResponse.json({ reply: "Algo falló — probá de nuevo en un segundo." }, { status: 200 });
  }
}
