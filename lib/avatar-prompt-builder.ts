/**
 * Prompts for fal.ai — 3D cartoon / Duolingo-adjacent expressive mascots.
 */

export const AVATAR_STYLE_BASE = `3D cartoon character, Duolingo style, expressive and friendly,
high quality render, soft studio lighting, pure white background,
colorful and vibrant, big expressive eyes, smooth glossy textures,
professional mascot design quality, centered composition, full body visible, cute`.replace(/\n/g, " ");

export type AvatarArchetype =
  | "human_male"
  | "human_female"
  | "dog"
  | "cat"
  | "rabbit"
  | "fox"
  | "panda"
  | "bear"
  | "orange"
  | "apple"
  | "cup"
  | "star"
  | "rocket"
  | "diamond";

export interface AvatarPromptConfig {
  archetype: AvatarArchetype;
  brandColor: string;
  brandColor2?: string;
  businessName: string;
  agentName: string;
  logoUrl?: string | null;
  /** Extra variation suffix for regenerations */
  variation?: number;
}

const TYPE_PROMPTS: Record<AvatarArchetype, string> = {
  human_male: `young friendly male mascot character, wearing a hoodie and shirt in brand colors`,
  human_female: `young friendly female mascot character, wearing a hoodie and shirt in brand colors`,
  dog: `cute anthropomorphic friendly dog mascot, expressive face, wearing a small bandana in brand colors`,
  cat: `cute anthropomorphic friendly cat mascot, big eyes, wearing a collar with brand colored accent`,
  rabbit: `cute anthropomorphic bunny mascot, soft ears, playful pose, brand colored vest`,
  fox: `cute anthropomorphic fox mascot, fluffy tail, clever smile, scarf in brand colors`,
  panda: `cute anthropomorphic panda mascot, round friendly face,bamboo optional, brand colored tee`,
  bear: `cute teddy-bear style mascot, warm smile, brand colored shirt`,
  orange: `cute orange fruit mascot with expressive cartoon face and tiny arms and legs`,
  apple: `cute apple fruit mascot with big eyes and smile, cartoon limbs`,
  cup: `cute coffee cup mascot character with face, small steam curl, glossy ceramic`,
  star: `cute golden star mascot with face and arms, sparkly expressive`,
  rocket: `cute rocket ship mascot with face on the window, friendly cartoon`,
  diamond: `cute faceted gem mascot with cartoon eyes and smile`,
};

export function buildAvatarPrompt(config: AvatarPromptConfig): string {
  const typeLine = TYPE_PROMPTS[config.archetype] ?? TYPE_PROMPTS.human_male;
  const logoInstruction = config.logoUrl
    ? `The character wears clothing with a subtle chest emblem area suitable for a small brand logo.`
    : "";
  const nameHint = `Subtle name energy for "${config.agentName}" and business "${config.businessName}" — cute, not text in the image.`;
  const colors = `Primary brand color ${config.brandColor}${config.brandColor2 ? `, accent ${config.brandColor2}` : ""}.`;
  const varSuffix =
    config.variation && config.variation > 0 ? ` Unique variation ${config.variation}, slightly different pose.` : "";

  return [
    AVATAR_STYLE_BASE,
    typeLine,
    colors,
    logoInstruction,
    nameHint,
    varSuffix.trim(),
  ]
    .filter(Boolean)
    .join(" ");
}

/** Maps onboarding UI internal keys → fal archetype */
export function mapSelectionToArchetype(
  category: "human" | "animal" | "fruit" | "object",
  subtype: string,
): AvatarArchetype {
  if (category === "human") {
    return subtype === "female" ? "human_female" : "human_male";
  }
  if (category === "animal") {
    const m: Record<string, AvatarArchetype> = {
      perro: "dog",
      gato: "cat",
      conejo: "rabbit",
      zorro: "fox",
      panda: "panda",
      oso: "bear",
      dog: "dog",
      cat: "cat",
      rabbit: "rabbit",
      fox: "fox",
      bear: "bear",
    };
    return m[subtype] ?? "dog";
  }
  if (category === "fruit") {
    const m: Record<string, AvatarArchetype> = {
      naranja: "orange",
      manzana: "apple",
      naranja_cartoon: "orange",
    };
    return m[subtype] ?? "orange";
  }
  /* object */
  const om: Record<string, AvatarArchetype> = {
    taza: "cup",
    estrella: "star",
    cohete: "rocket",
    diamante: "diamond",
    cup: "cup",
    star: "star",
    rocket: "rocket",
    diamond: "diamond",
  };
  return om[subtype] ?? "cup";
}
