"use client";

/**
 * BrandAvatar — Lottie character system
 *
 * 4 personajes profesionales seleccionables × cualquier brandColor
 * Animations: idle (loop), wave (saludo), thinking (mientras escribe), talking (mientras responde)
 * La ropa toma el brandColor automáticamente via reemplazo de colores en el JSON de animación
 */

import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { useEffect, useRef, useState } from "react";

// ── Brand clothing color engine ────────────────────────────

// Hex colors that correspond to clothing in each character's Lottie JSON.
// Identified by extracting all unique fill colors and excluding skin/hair/neutral tones.
const CHAR_CLOTHING: Record<string, string[]> = {
  // Alex & Jordan share the same character base (waving man):
  //   Jacket = dark maroon shades; Pants = dark navy shades
  alex:   ["#3a2025", "#292025", "#1b1326", "#1d1c31", "#1f3c7d", "#1f3c49"],
  jordan: ["#3a2025", "#292025", "#1b1326", "#1d1c31", "#1f3c7d", "#1f3c49"],
  // Sam: light blue dress/outfit
  sam:    ["#80b2d5", "#9ed4e3", "#c3e7f3"],
  // Mia: hot pink outfit
  mia:    ["#f31470", "#f54693"],
};

function parseHex(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

function perceivedLum(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

type ColorEntry = { orig: [number, number, number]; next: [number, number, number] };

function buildColorMap(clothingHexes: string[], brandHex: string): ColorEntry[] {
  const [br, bg, bb] = parseHex(brandHex);
  const brandLum = perceivedLum(br, bg, bb);
  return clothingHexes.map(hex => {
    const [or, og, ob] = parseHex(hex);
    const scale = brandLum > 0 ? perceivedLum(or, og, ob) / brandLum : 0;
    return {
      orig: [or, og, ob],
      next: [Math.min(1, br * scale), Math.min(1, bg * scale), Math.min(1, bb * scale)],
    };
  });
}

function replaceColorsInObj(obj: unknown, map: ColorEntry[], tol = 0.015): void {
  if (typeof obj !== "object" || obj === null) return;
  if (Array.isArray(obj)) { obj.forEach(i => replaceColorsInObj(i, map, tol)); return; }
  const o = obj as Record<string, unknown>;

  // Static fill/stroke: { c: { a: 0, k: [r, g, b, a] } }
  const c = o.c as Record<string, unknown> | undefined;
  if (c && typeof c === "object" && !Array.isArray(c) && c.a === 0 && Array.isArray(c.k) && (c.k as number[]).length >= 3) {
    const k = c.k as number[];
    for (const { orig, next } of map) {
      if (Math.abs(k[0] - orig[0]) < tol && Math.abs(k[1] - orig[1]) < tol && Math.abs(k[2] - orig[2]) < tol) {
        c.k = [next[0], next[1], next[2], ...k.slice(3)];
        break;
      }
    }
  }

  for (const key of Object.keys(o)) replaceColorsInObj(o[key], map, tol);
}

function applyBrandColors(animData: object, character: string, brandHex: string): object {
  const clothing = CHAR_CLOTHING[character];
  if (!clothing?.length) return animData;
  const map = buildColorMap(clothing, brandHex);
  const clone = JSON.parse(JSON.stringify(animData)) as object;
  replaceColorsInObj(clone, map);
  return clone;
}

// ── Types ─────────────────────────────────────────────────
export type AvatarCharacter = "alex" | "sam" | "jordan" | "mia";
export type AvatarAnim      = "idle" | "wave" | "thinking" | "talking";

export interface BrandAvatarProps {
  character?  : AvatarCharacter;
  brandColor? : string;
  brandName?  : string;
  animation?  : AvatarAnim;
  isSpeaking? : boolean;
  size?       : number;
  className?  : string;
}

// ── Character metadata ─────────────────────────────────────
export const AVATAR_CHARS: Record<AvatarCharacter, { label: string; description: string }> = {
  alex:   { label: "Alex",   description: "Profesional, cercano" },
  sam:    { label: "Sam",    description: "Dinámico, creativo" },
  jordan: { label: "Jordan", description: "Amigable, informal" },
  mia:    { label: "Mia",    description: "Reflexivo, analítico" },
};

// ── Playback speed per state ───────────────────────────────
const SPEED: Record<AvatarAnim, number> = {
  idle:     1,
  wave:     1.2,
  thinking: 0.6,
  talking:  1.8,
};

// ── Main component ─────────────────────────────────────────
export default function BrandAvatar({
  character  = "alex",
  brandColor = "#7c6cff",
  brandName  = "Meetzy",
  animation  = "idle",
  isSpeaking = false,
  size       = 220,
  className  = "",
}: BrandAvatarProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [animData, setAnimData] = useState<object | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load the JSON for this character and apply brand clothing colors
  useEffect(() => {
    setLoaded(false);
    setAnimData(null);
    fetch(`/avatars/${character}.json`)
      .then(r => r.json())
      .then(d => {
        const branded = applyBrandColors(d as object, character, brandColor);
        setAnimData(branded);
        setLoaded(true);
      })
      .catch(() => setLoaded(false));
  }, [character, brandColor]);

  // Set playback speed based on animation state
  useEffect(() => {
    if (!lottieRef.current) return;
    const speed = isSpeaking ? SPEED.talking : SPEED[animation];
    lottieRef.current.setSpeed(speed);
  }, [animation, isSpeaking]);

  const isTalking  = isSpeaking || animation === "talking";
  const isThinking = animation === "thinking" && !isSpeaking;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Brand color halo — changes with brand */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 60%, ${brandColor}22 0%, transparent 70%)`,
          transform: "scale(1.15)",
        }}
      />

      {/* Talking rings */}
      {isTalking && (
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{ zIndex: 0 }}>
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `2px solid ${brandColor}`,
              animation: "avatar-ring 1.2s ease-out infinite",
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `2px solid ${brandColor}`,
              animation: "avatar-ring 1.2s ease-out 0.4s infinite",
            }}
          />
        </div>
      )}

      {/* Lottie animation */}
      {loaded && animData ? (
        <Lottie
          lottieRef={lottieRef}
          animationData={animData}
          loop
          autoplay
          style={{ width: "90%", height: "90%", position: "relative", zIndex: 1 }}
        />
      ) : (
        // Skeleton while loading
        <div
          className="rounded-full animate-pulse"
          style={{ width: "75%", height: "75%", background: `${brandColor}22` }}
        />
      )}

      {/* Brand badge */}
      {brandName && (
        <div
          className="absolute bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-white font-bold whitespace-nowrap pointer-events-none"
          style={{
            fontSize: 9,
            letterSpacing: "0.08em",
            background: brandColor,
            boxShadow: `0 2px 8px ${brandColor}55`,
            zIndex: 2,
          }}
        >
          {brandName.toUpperCase().slice(0, 12)}
        </div>
      )}

      {/* Thinking dots */}
      {isThinking && (
        <div
          className="absolute top-1 right-1 flex gap-1 items-end pointer-events-none"
          style={{ zIndex: 3 }}
        >
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: 6 + i * 2,
                height: 6 + i * 2,
                background: brandColor,
                opacity: 0.7,
                animation: `avatar-think 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Status dot */}
      <div
        className="absolute bottom-2 right-2 rounded-full border-2 border-[var(--bg-elevated,#1a1928)]"
        style={{
          width: 10,
          height: 10,
          background: isTalking ? brandColor : "#22c55e",
          boxShadow: isTalking
            ? `0 0 8px ${brandColor}`
            : "0 0 6px rgba(34,197,94,0.6)",
          zIndex: 3,
          transition: "background 0.3s",
        }}
      />

      {/* CSS keyframes */}
      <style>{`
        @keyframes avatar-ring {
          0%   { transform: scale(0.85); opacity: 0.7; }
          100% { transform: scale(1.3);  opacity: 0; }
        }
        @keyframes avatar-think {
          0%, 100% { transform: translateY(0);    opacity: 0.5; }
          50%       { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Small version — for chat headers / FABs ────────────────
export function BrandAvatarSmall({
  character  = "alex",
  brandColor = "#7c6cff",
  isSpeaking = false,
  size       = 44,
}: Pick<BrandAvatarProps, "character" | "brandColor" | "isSpeaking" | "size">) {
  return (
    <BrandAvatar
      character={character}
      brandColor={brandColor}
      brandName=""
      isSpeaking={isSpeaking}
      animation="idle"
      size={size}
    />
  );
}

// ── Character picker for wizard step 3 ────────────────────
export function AvatarPicker({
  value,
  onChange,
  brandColor = "#7c6cff",
}: {
  value    : AvatarCharacter;
  onChange : (c: AvatarCharacter) => void;
  brandColor?: string;
}) {
  const chars = Object.keys(AVATAR_CHARS) as AvatarCharacter[];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {chars.map(c => {
        const meta = AVATAR_CHARS[c];
        const active = value === c;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`flex flex-col items-center gap-2 rounded-[var(--radius-lg)] p-3 border-2 transition-all duration-200
              ${active
                ? "border-[var(--accent)] bg-[var(--accent)]/8 scale-[1.04]"
                : "border-[var(--border-default)] hover:border-[var(--border-strong)] hover:scale-[1.02]"
              }`}
          >
            <BrandAvatar
              character={c}
              brandColor={brandColor}
              brandName=""
              animation="idle"
              size={96}
            />
            <div className="text-center">
              <p className={`text-[13px] font-semibold ${active ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>
                {meta.label}
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)]">{meta.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
