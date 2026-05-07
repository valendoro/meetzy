import type { Site } from "@prisma/client";
import type { AvatarArchetype } from "@/lib/avatar-prompt-builder";

export interface AvatarConfig {
  style: "realistic" | "cartoon" | "object";
  businessType: string;
  characterType: string;
  brandColor: string;
  brandColor2?: string;
  logoUrl?: string;
  agentName: string;
  freeDescription?: string;
}

export interface GeneratedAvatar {
  imageUrl: string;
  prompt: string;
  generationId: string;
}

const ARCHETYPE_CHARACTER: Record<AvatarArchetype, string> = {
  human_male: "friendly human male mascot character",
  human_female: "friendly human female mascot character",
  dog: "cute anthropomorphic dog mascot",
  cat: "cute anthropomorphic cat mascot",
  rabbit: "cute anthropomorphic bunny mascot",
  fox: "cute anthropomorphic fox mascot",
  panda: "cute anthropomorphic panda mascot",
  bear: "cute teddy-bear style mascot",
  orange: "cute orange fruit mascot with expressive cartoon face and limbs",
  apple: "cute apple fruit mascot with big eyes",
  cup: "cute coffee cup mascot with face on the cup",
  star: "cute golden star mascot with arms and expressive face",
  rocket: "cute rocket ship mascot with face",
  diamond: "cute faceted gem mascot with cartoon eyes",
};

export function archetypeToCharacterType(archetype: AvatarArchetype): string {
  return ARCHETYPE_CHARACTER[archetype] ?? ARCHETYPE_CHARACTER.human_male;
}

export function describeSiteCharacter(site: {
  avatarType: string | null;
  avatarSubtype: string | null;
}): string {
  const t = site.avatarType ?? "human";
  const s = site.avatarSubtype ?? "";
  if (t === "human") {
    return s === "female"
      ? ARCHETYPE_CHARACTER.human_female
      : ARCHETYPE_CHARACTER.human_male;
  }
  if (t === "animal") {
    const map: Record<string, string> = {
      perro: ARCHETYPE_CHARACTER.dog,
      gato: ARCHETYPE_CHARACTER.cat,
    };
    return map[s] ?? ARCHETYPE_CHARACTER.dog;
  }
  const omap: Record<string, string> = {
    naranja: ARCHETYPE_CHARACTER.orange,
    taza: ARCHETYPE_CHARACTER.cup,
    estrella: ARCHETYPE_CHARACTER.star,
  };
  return omap[s] ?? ARCHETYPE_CHARACTER.cup;
}

export function siteToAvatarConfig(site: Site): AvatarConfig {
  const cfg = site.avatarConfig as { freeDescription?: string; businessType?: string } | null;
  return {
    style: (site.avatarStyle as AvatarConfig["style"]) || "cartoon",
    businessType: cfg?.businessType?.trim() || site.name || "business",
    characterType: describeSiteCharacter(site),
    brandColor: site.brandColor,
    brandColor2: site.brandColor2 || undefined,
    logoUrl: site.logoUrl || undefined,
    agentName: site.agentName,
    freeDescription: cfg?.freeDescription,
  };
}
