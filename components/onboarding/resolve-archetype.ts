import type { AvatarArchetype } from "@/lib/avatar-prompt-builder";

export type PrimaryChar = "human" | "perro" | "gato" | "fruta" | "objeto" | "animal";

export function resolveArchetype(primary: PrimaryChar | null, subtype: string): AvatarArchetype | null {
  if (!primary) return null;
  if (primary === "perro") return "dog";
  if (primary === "gato") return "cat";
  if (primary === "human") {
    return subtype === "female" ? "human_female" : "human_male";
  }
  if (primary === "fruta") {
    return subtype === "manzana" ? "apple" : "orange";
  }
  if (primary === "objeto") {
    const m: Record<string, AvatarArchetype> = {
      taza: "cup",
      estrella: "star",
      cohete: "rocket",
      diamante: "diamond",
    };
    return m[subtype] ?? "cup";
  }
  /* animal subgrid */
  const am: Record<string, AvatarArchetype> = {
    perro: "dog",
    gato: "cat",
    conejo: "rabbit",
    zorro: "fox",
    panda: "panda",
    oso: "bear",
  };
  return am[subtype] ?? "dog";
}
