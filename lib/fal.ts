import { fal } from "@fal-ai/client";
import sharp from "sharp";
import { getOpenAI, isOpenAIConfigured } from "@/lib/openai";
import type { AvatarConfig, GeneratedAvatar } from "@/lib/avatar-config";

const MODEL_MAP = {
  realistic: "fal-ai/flux-pro",
  cartoon: "fal-ai/flux/schnell",
  object: "fal-ai/flux-pro",
} as const;

const TRANSPARENT_RULES = `transparent background, no background, isolated character, PNG with alpha channel,
isolated on transparent, no background elements, cut out character, alpha channel, PNG format.`;

/** fal / GPT must never imply a solid or colored backdrop — only full transparency. */
const NEVER_BACKGROUND = `Never use: white background, solid background, studio backdrop,
gradient background, floor, wall, environment, sky, or any colored fill behind the subject.`;

export type { AvatarConfig, GeneratedAvatar } from "@/lib/avatar-config";

export function isFalConfigured(): boolean {
  return typeof process.env.FAL_KEY === "string" && process.env.FAL_KEY.trim().length > 0;
}

export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
    process.env.CLOUDINARY_API_KEY?.trim() &&
    process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

function configure(): void {
  const key = process.env.FAL_KEY?.trim();
  if (!key) throw new Error("FAL_KEY is not configured");
  fal.config({ credentials: key });
}

type FalImageResult = {
  data: { images?: { url: string }[] };
  requestId: string;
};

async function runFluxModel(style: AvatarConfig["style"], prompt: string): Promise<FalImageResult> {
  configure();
  const model = MODEL_MAP[style];
  const isSchnell = model === "fal-ai/flux/schnell";

  const input = isSchnell
    ? {
        prompt,
        image_size: "square" as const,
        num_inference_steps: 4,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
        output_format: "png" as const,
      }
    : {
        prompt,
        image_size: "square_hd" as const,
        num_inference_steps: 28,
        guidance_scale: 7,
        num_images: 1,
        output_format: "png" as const,
      };

  const timeoutMs = isSchnell ? 60_000 : 120_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await fal.subscribe(model as any, {
      input,
      abortSignal: controller.signal,
    });
    return res as FalImageResult;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchUrlToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Remove near-white pixels (model may still hint at a backdrop).
 * Threshold 240 on R,G,B → alpha 0.
 */
export async function removeBackground(imageBuffer: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(imageBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const buf = Buffer.from(data);
  const w = info.width;
  const h = info.height;
  const channels = info.channels;

  if (channels !== 4) {
    return sharp(imageBuffer).png().toBuffer();
  }

  for (let i = 0; i < buf.length; i += 4) {
    const r = buf[i]!;
    const g = buf[i + 1]!;
    const b = buf[i + 2]!;
    if (r > 240 && g > 240 && b > 240) {
      buf[i + 3] = 0;
    }
  }

  return sharp(buf, {
    raw: {
      width: w,
      height: h,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

async function compositeLogoOnAvatarBuffer(avatarPngBuffer: Buffer, logoUrl: string): Promise<Buffer> {
  const logoRes = await fetch(logoUrl);
  if (!logoRes.ok) throw new Error("Failed to download logo image");

  const logoBuffer = Buffer.from(await logoRes.arrayBuffer());

  const meta = await sharp(avatarPngBuffer).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;
  const targetLogo = Math.max(48, Math.round(w * 0.2));

  const logoResized = await sharp(logoBuffer)
    .resize(targetLogo, targetLogo, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const left = Math.round((w - targetLogo) / 2);
  const top = Math.max(0, h - targetLogo - Math.round(h * 0.04));

  return sharp(avatarPngBuffer)
    .composite([{ input: logoResized, left, top }])
    .png()
    .toBuffer();
}

function fallbackPrompt(config: AvatarConfig): string {
  return [
    `Commercial mascot avatar for ${config.businessType}.`,
    `Character: ${config.characterType}.`,
    `Primary brand color ${config.brandColor}${config.brandColor2 ? `, accent ${config.brandColor2}` : ""} on the character only — not as a backdrop.`,
    `Agent energy for "${config.agentName}".`,
    config.freeDescription || "",
    TRANSPARENT_RULES,
    NEVER_BACKGROUND,
    config.style === "realistic"
      ? "Photorealistic human or animal, soft neutral lighting on the subject only, friendly expression, single isolated subject, no text, no watermarks."
      : config.style === "object"
        ? "High quality 3D cartoon: anthropomorphic product or object with expressive face; vibrant colors on the mascot only."
        : "3D cartoon mascot inspired by Pixar/Duolingo, expressive eyes, vibrant character colors, strong personality.",
    "centered composition, commercial mascot quality, no text, no watermarks, single character.",
  ]
    .filter(Boolean)
    .join(" ");
}

export async function generateAvatarPrompt(config: AvatarConfig): Promise<string> {
  if (!isOpenAIConfigured()) {
    return fallbackPrompt(config);
  }

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert in prompt engineering for FLUX image generation.
Convert avatar configuration into a single technical image prompt.
Reply with ONLY the prompt, no quotes or explanations.
The prompt must be in English.
Maximum 120 words.
The character MUST be on a fully transparent background (alpha). ${NEVER_BACKGROUND}
Always include: ${TRANSPARENT_RULES}`,
      },
      {
        role: "user",
        content: `Generate a prompt for a brand mascot avatar:

Business type: ${config.businessType}
Character type: ${config.characterType}
Style: ${config.style}
Brand color: ${config.brandColor} (use on clothing/accessories/mascot only, never as backdrop)
Agent name: ${config.agentName}
Extra description: ${config.freeDescription || "none"}

STYLE RULES:

If style is "realistic":
- Photorealistic human or photorealistic animal
- Professional lighting on the subject only (no environment)
- Clothing incorporating ${config.brandColor}
- ${TRANSPARENT_RULES}

If style is "cartoon":
- 3D cartoon, Pixar/Duolingo inspired
- Large expressive eyes, cartoon proportions
- Vibrant colors with ${config.brandColor} on the character
- Centered character
- ${TRANSPARENT_RULES}

If style is "object":
- Representative object or element as mascot
- Expressive face integrated naturally
- High quality 3D cartoon
- ${config.brandColor} as main accent on the object/character
- ${TRANSPARENT_RULES}

ALWAYS include exactly these concepts (paraphrase ok):
- transparent background, isolated on transparent, cut-out / alpha / PNG
- commercial mascot quality
- no text, no watermarks
- single character
${NEVER_BACKGROUND}`,
      },
    ],
    max_tokens: 200,
  });

  const text = response.choices[0]?.message?.content?.trim() || "";
  return text || fallbackPrompt(config);
}

async function uploadToCloudinary(imageSource: string, publicIdBase: string): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }
  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const safeBase = (publicIdBase || "meetzy").replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 40);

  const baseOpts = {
    folder: "meetzy/avatars",
    public_id: `avatar-${safeBase}-${Date.now()}`,
    overwrite: false,
    resource_type: "image" as const,
    format: "png",
    transformation: [{ width: 512, height: 512, crop: "fill" }],
    ...(process.env.CLOUDINARY_AI_BACKGROUND_REMOVAL === "true"
      ? { background_removal: "cloudinary_ai" as const }
      : {}),
  };

  try {
    const result = await cloudinary.uploader.upload(imageSource, baseOpts as unknown as Record<string, unknown>);
    return result.secure_url as string;
  } catch (first) {
    if (process.env.CLOUDINARY_AI_BACKGROUND_REMOVAL === "true") {
      console.warn("[avatar] Cloudinary upload with background_removal failed, retrying without:", first);
      const result = await cloudinary.uploader.upload(imageSource, {
        folder: "meetzy/avatars",
        public_id: `avatar-${safeBase}-${Date.now()}-fallback`,
        overwrite: false,
        resource_type: "image",
        format: "png",
        transformation: [{ width: 512, height: 512, crop: "fill" }],
      });
      return result.secure_url as string;
    }
    throw first;
  }
}

export type GenerateAvatarOptions = {
  requireCloudinary?: boolean;
  variationSeed?: number;
};

export async function generateAvatarPipelineFromFalUrl(
  falUrl: string,
  config: Partial<Pick<AvatarConfig, "logoUrl" | "agentName">> = {},
  options: { requireCloudinary?: boolean; cloudinaryPublicIdBase?: string } = {},
): Promise<{ imageUrl: string; buffer: Buffer }> {
  const requireCloudinary = options.requireCloudinary ?? false;
  const rawBuf = await fetchUrlToBuffer(falUrl);
  let transparentBuf = await removeBackground(rawBuf);

  if (config.logoUrl?.trim()) {
    try {
      transparentBuf = await compositeLogoOnAvatarBuffer(transparentBuf, config.logoUrl.trim());
    } catch (e) {
      console.warn("[avatar] logo composite skipped:", e);
    }
  }

  const dataUri = `data:image/png;base64,${transparentBuf.toString("base64")}`;

  if (isCloudinaryConfigured()) {
    const idBase = options.cloudinaryPublicIdBase ?? config.agentName ?? "meetzy";
    const url = await uploadToCloudinary(dataUri, idBase);
    return { imageUrl: url, buffer: transparentBuf };
  }

  if (requireCloudinary) {
    throw new Error(
      "Cloudinary is not configured (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET required to store avatars).",
    );
  }

  return { imageUrl: dataUri, buffer: transparentBuf };
}

export async function generateAvatar(
  config: AvatarConfig,
  options: GenerateAvatarOptions = {},
): Promise<GeneratedAvatar> {
  const requireCloudinary = options.requireCloudinary ?? true;

  if (!isFalConfigured()) {
    throw new Error("FAL_KEY is not configured");
  }

  const basePrompt = await generateAvatarPrompt(config);
  const fluxPrompt =
    options.variationSeed && options.variationSeed > 0
      ? `${basePrompt} Variation ${options.variationSeed}, different pose and expression.`
      : basePrompt;
  const result = await runFluxModel(config.style, fluxPrompt);
  const falUrl = result.data.images?.[0]?.url;
  if (!falUrl) {
    throw new Error("No image returned from fal.ai");
  }

  const { imageUrl } = await generateAvatarPipelineFromFalUrl(falUrl, config, {
    requireCloudinary,
    cloudinaryPublicIdBase: config.agentName,
  });

  return { imageUrl, prompt: basePrompt, generationId: result.requestId };
}

export async function generateAvatarPreview(config: AvatarConfig): Promise<GeneratedAvatar> {
  if (!isFalConfigured()) {
    throw new Error("FAL_KEY is not configured");
  }
  const cartoonConfig: AvatarConfig = { ...config, style: "cartoon" };
  const prompt = await generateAvatarPrompt(cartoonConfig);
  const result = await runFluxModel("cartoon", prompt);
  const falUrl = result.data.images?.[0]?.url;
  if (!falUrl) {
    throw new Error("No preview image returned");
  }
  const { imageUrl } = await generateAvatarPipelineFromFalUrl(falUrl, cartoonConfig, {
    requireCloudinary: false,
    cloudinaryPublicIdBase: `${config.agentName}-preview`,
  });
  return { imageUrl, prompt, generationId: result.requestId };
}

export type FluxGenerateResult = { url: string | null; error?: string };

export async function generateFluxAvatarImage(prompt: string, variation?: number): Promise<FluxGenerateResult> {
  if (!isFalConfigured()) {
    return { url: null, error: "FAL_KEY not configured" };
  }
  const finalPrompt =
    variation && variation > 0 ? `${prompt} Alternative take ${variation}, different pose and expression.` : prompt;
  try {
    const res = await runFluxModel("cartoon", finalPrompt);
    const falUrl = res.data.images?.[0]?.url ?? null;
    if (!falUrl) return { url: null, error: "No image" };
    const { imageUrl } = await generateAvatarPipelineFromFalUrl(
      falUrl,
      {},
      { requireCloudinary: false, cloudinaryPublicIdBase: "legacy" },
    );
    return { url: imageUrl };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "flux error";
    console.error("[fal]", msg);
    return { url: null, error: msg };
  }
}
