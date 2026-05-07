import { fal } from "@fal-ai/client";

const ENDPOINT = "fal-ai/flux/schnell";

export function isFalConfigured(): boolean {
  return typeof process.env.FAL_KEY === "string" && process.env.FAL_KEY.trim().length > 0;
}

function configure(): void {
  const key = process.env.FAL_KEY?.trim();
  if (!key) throw new Error("FAL_KEY is not configured");
  fal.config({ credentials: key });
}

export type FluxGenerateResult = { url: string | null; error?: string };

/**
 * Generates a square HD avatar image. 30s abort. Returns null URL on failure.
 */
export async function generateFluxAvatarImage(prompt: string, variation?: number): Promise<FluxGenerateResult> {
  if (!isFalConfigured()) {
    return { url: null, error: "FAL_KEY not configured" };
  }
  configure();
  const finalPrompt =
    variation && variation > 0 ? `${prompt} Alternative take ${variation}, different pose and expression.` : prompt;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await fal.subscribe(ENDPOINT as any, {
      input: {
        prompt: finalPrompt,
        image_size: "square_hd",
        num_inference_steps: 4,
        num_images: 1,
      },
      abortSignal: controller.signal,
    });
    const data = res.data as { images?: { url: string }[] };
    const url = data.images?.[0]?.url ?? null;
    return { url };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "flux error";
    console.error("[fal]", msg);
    return { url: null, error: msg };
  } finally {
    clearTimeout(timer);
  }
}
