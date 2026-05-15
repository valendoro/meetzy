"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useProductToast } from "@/components/providers/product-toast";
import { Button } from "@/components/ui/button";
import { Shuffle, Sparkles, Loader2, Check, Upload, RefreshCw } from "lucide-react";
import { describeSiteCharacter } from "@/lib/avatar-config";

interface SiteData {
  siteId: string;
  name: string;
  agentName: string;
  avatarType: string | null;
  avatarSubtype: string | null;
  brandColor: string;
  brandColor2: string;
  logoUrl: string | null;
  avatarImageUrl: string | null;
  avatarStyle: string | null;
  avatarGenerations: number;
  avatarConfig: unknown;
}

/* ── DiceBear styles ─────────────────────────────────────── */

const STYLES = [
  { id: "lorelei",       label: "Lorelei",      emoji: "🌸", desc: "Ilustrado amigable, rasgos detallados" },
  { id: "avataaars",     label: "Avataaars",     emoji: "😊", desc: "Estilo Slack, muy reconocible" },
  { id: "micah",         label: "Micah",         emoji: "✏️", desc: "Líneas limpias y modernas" },
  { id: "personas",      label: "Personas",      emoji: "👤", desc: "Semi-realista, profesional" },
  { id: "bottts",        label: "Bottts",        emoji: "🤖", desc: "Robot — ideal para SaaS / IA" },
  { id: "notionists",    label: "Notionists",    emoji: "📝", desc: "Minimalista estilo Notion" },
  { id: "big-smile",     label: "Big Smile",     emoji: "😁", desc: "Expresivo y positivo" },
  { id: "pixel-art",     label: "Pixel Art",     emoji: "🕹️", desc: "Retro pixelado, memorable" },
  { id: "fun-emoji",     label: "Fun Emoji",     emoji: "🎭", desc: "Emoji expresivo y divertido" },
  { id: "croodles",      label: "Croodles",      emoji: "✍️", desc: "Trazo a mano, cercano" },
  { id: "open-peeps",    label: "Open Peeps",    emoji: "🧑", desc: "Personajes planos modernos" },
  { id: "adventurer",    label: "Adventurer",    emoji: "⚔️", desc: "Aventurero ilustrado vibrante" },
] as const;

type StyleId = (typeof STYLES)[number]["id"];

const BG_PRESETS = [
  { label: "Sin fondo",  hex: "",       dark: false },
  { label: "Azul",       hex: "b6e3f4", dark: false },
  { label: "Lavanda",    hex: "c0aede", dark: false },
  { label: "Índigo",     hex: "d1d4f9", dark: false },
  { label: "Rosa",       hex: "ffd5dc", dark: false },
  { label: "Durazno",    hex: "ffdfbf", dark: false },
  { label: "Limón",      hex: "f4d150", dark: false },
  { label: "Menta",      hex: "c7f2a4", dark: false },
  { label: "Gris",       hex: "e2e8f0", dark: false },
  { label: "Carbón",     hex: "1e1e2e", dark: true  },
];

/* ── Helpers ─────────────────────────────────────────────── */

function buildUrl(style: StyleId, seed: string, bg: string): string {
  const p = new URLSearchParams({ seed });
  if (bg) p.set("backgroundColor", bg);
  return `https://api.dicebear.com/9.x/${style}/svg?${p}`;
}

function buildUrlPng(style: StyleId, seed: string, bg: string, size = 256): string {
  const p = new URLSearchParams({ seed, size: String(size) });
  if (bg) p.set("backgroundColor", bg);
  return `https://api.dicebear.com/9.x/${style}/png?${p}`;
}

function randSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

function initialSeed(site: SiteData): string {
  return site.agentName.toLowerCase().replace(/\s+/g, "-");
}

function initialStyle(site: SiteData): StyleId {
  if (site.avatarStyle && STYLES.some((s) => s.id === site.avatarStyle)) {
    return site.avatarStyle as StyleId;
  }
  return "lorelei";
}

/* ── Guide message system ────────────────────────────────── */

type GuideSection = "style" | "bg" | "seed" | "ai" | "saved" | null;

function buildGuideMessage(
  section: GuideSection,
  { agentName, styleLabel, bgLabel, seed }: { agentName: string; styleLabel: string; bgLabel: string; seed: string },
): string {
  switch (section) {
    case "style": return `¡Probá los estilos! Ahora soy "${styleLabel}" 👀`;
    case "bg":    return `Fondo ${bgLabel || "transparente"} — ¡me queda bien! 🎨`;
    case "seed":  return `Semilla "${seed}" — así son mis rasgos únicos 🎲`;
    case "ai":    return "¡Generame un avatar HD con IA! ✨";
    case "saved": return "¡Guardado! Así voy a aparecer en tu sitio 🎉";
    default:      return `¡Hola, soy ${agentName}! Configurá mi look 👇`;
  }
}

/* ── StyleCard ───────────────────────────────────────────── */

function StyleCard({
  style, seed, bg, selected, onClick, onHoverEnter, onHoverLeave,
}: {
  style: (typeof STYLES)[number];
  seed: string;
  bg: string;
  selected: boolean;
  onClick: () => void;
  onHoverEnter: () => void;
  onHoverLeave: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
      className={`group relative flex flex-col items-center gap-1.5 rounded-[var(--radius-lg)] border p-2.5 text-center transition-all duration-150 ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent)]"
          : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--border-default)] hover:bg-[var(--bg-overlay)]"
      }`}
    >
      {selected && (
        <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-[var(--accent)]">
          <Check className="size-2.5 text-white" />
        </span>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={buildUrl(style.id, seed, bg)}
        alt={style.label}
        className="size-12 rounded-full object-cover"
        loading="lazy"
      />
      <p className={`text-[10px] font-semibold leading-tight truncate w-full ${selected ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}>
        {style.label}
      </p>
    </button>
  );
}

/* ── Step header ─────────────────────────────────────────── */

function StepHeader({ n, title, subtitle }: { n: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[11px] font-bold text-[var(--accent)] ring-1 ring-[rgba(99,102,241,0.3)] mt-0.5">
        {n}
      </span>
      <div>
        <h3 className="font-syne text-[13px] font-bold text-[var(--text-primary)]">{title}</h3>
        <p className="mt-0.5 text-[11px] text-[var(--text-tertiary)]">{subtitle}</p>
      </div>
    </div>
  );
}

/* ── Speech bubble ───────────────────────────────────────── */

function SpeechBubble({ message }: { message: string }) {
  return (
    <div className="relative mx-auto max-w-[220px]" key={message} style={{ animation: "bubblePop 0.28s cubic-bezier(0.34,1.56,0.64,1)" }}>
      <div className="rounded-[14px] rounded-bl-[4px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3.5 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
        <p className="text-center text-[12px] leading-snug text-[var(--text-secondary)]">{message}</p>
      </div>
      {/* Tail */}
      <svg
        className="absolute -bottom-[9px] left-8 text-[var(--bg-surface)]"
        width="16" height="10" viewBox="0 0 16 10"
        fill="currentColor"
      >
        <path d="M0 0 C4 0, 8 10, 16 0Z" />
      </svg>
      {/* Tail border */}
      <svg
        className="absolute -bottom-[10px] left-8 text-[var(--border-default)]"
        style={{ zIndex: -1 }}
        width="18" height="11" viewBox="0 0 18 11"
        fill="currentColor"
      >
        <path d="M0 0 C5 0, 9 11, 18 0Z" />
      </svg>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */

export default function AvatarConfigurator({ site }: { site: SiteData }) {
  const router = useRouter();
  const { push } = useProductToast();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [selectedStyle, setSelectedStyle] = useState<StyleId>(initialStyle(site));
  const [hoveredStyle, setHoveredStyle] = useState<StyleId | null>(null);
  const [seed, setSeed] = useState(initialSeed(site));
  const [bg, setBg] = useState("d1d4f9");
  const [guideSection, setGuideSection] = useState<GuideSection>(null);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState(site.logoUrl ?? "");
  const [logoUploading, setLogoUploading] = useState(false);

  // AI generation state
  const [aiStyle, setAiStyle] = useState<"cartoon" | "realistic" | "object">(
    (site.avatarStyle as "cartoon" | "realistic" | "object") || "cartoon",
  );
  const [businessType, setBusinessType] = useState(
    (site.avatarConfig as { businessType?: string } | null)?.businessType ?? "",
  );
  const [freeDesc, setFreeDesc] = useState(
    (site.avatarConfig as { freeDescription?: string } | null)?.freeDescription ?? "",
  );
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreviewing, setAiPreviewing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(site.avatarImageUrl ?? null);
  const [isAiImage, setIsAiImage] = useState(
    !!site.avatarImageUrl && !site.avatarImageUrl.includes("dicebear"),
  );

  const genUsed = site.avatarGenerations;
  const genLeft = Math.max(0, 3 - genUsed);

  // The style actually shown in the guide (hover preview vs selected)
  const previewStyle = hoveredStyle ?? selectedStyle;
  const previewStyleInfo = STYLES.find((s) => s.id === previewStyle)!;
  const bgLabel = BG_PRESETS.find((p) => p.hex === bg)?.label ?? "Custom";

  const dicebearPreviewUrl = buildUrl(previewStyle, seed, bg);
  const guideMessage = buildGuideMessage(guideSection, {
    agentName: site.agentName,
    styleLabel: previewStyleInfo.label,
    bgLabel,
    seed,
  });

  async function handleSaveDicebear() {
    setSaving(true);
    try {
      const url = buildUrlPng(selectedStyle, seed, bg, 256);
      const res = await fetch(`/api/sites/${site.siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarImageUrl: url,
          avatarStyle: selectedStyle,
          avatarType: "dicebear",
          avatarSubtype: seed,
          brandColor: site.brandColor,
          brandColor2: site.brandColor2,
          logoUrl: logoUrl || null,
          avatarConfig: { dicebearStyle: selectedStyle, dicebearSeed: seed, dicebearBg: bg },
        }),
      });
      if (res.ok) {
        setCurrentImage(url);
        setIsAiImage(false);
        setGuideSection("saved");
        push("Avatar guardado ✓", "success");
        router.refresh();
        setTimeout(() => setGuideSection(null), 3500);
      } else {
        push("Error al guardar el avatar", "error");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(file: File) {
    if (file.size > 2_500_000) { push("Imagen muy grande (máx 2MB)", "error"); return; }
    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const mime = file.type as "image/png" | "image/jpeg" | "image/webp";
      try {
        const res = await fetch("/api/onboarding/upload-logo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: mime }),
        });
        const j = (await res.json()) as { url?: string; error?: string };
        if (j.url) { setLogoUrl(j.url); push("Logo cargado", "success"); }
        else push(j.error ?? "Error al subir", "error");
      } catch { push("Error de red", "error"); }
      setLogoUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function buildAiConfig() {
    return {
      style: aiStyle,
      businessType: businessType.trim() || site.name,
      characterType: describeSiteCharacter({ avatarType: site.avatarType, avatarSubtype: site.avatarSubtype }),
      brandColor: site.brandColor,
      brandColor2: site.brandColor2 || undefined,
      logoUrl: logoUrl.trim() || undefined,
      agentName: site.agentName,
      freeDescription: freeDesc.trim() || undefined,
    };
  }

  async function handleAiPreview() {
    setAiPreviewing(true);
    try {
      const res = await fetch("/api/avatar/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: buildAiConfig() }),
      });
      const j = (await res.json()) as { previewUrl?: string; error?: string };
      if (!res.ok) { push(j.error ?? "Preview no disponible", "error"); return; }
      if (j.previewUrl) { setCurrentImage(j.previewUrl); setIsAiImage(true); push("Preview lista ✓", "success"); }
    } catch { push("Error de red", "error"); }
    finally { setAiPreviewing(false); }
  }

  async function handleAiGenerate() {
    if (genLeft <= 0) { push("Ya usaste las 3 generaciones disponibles.", "warning"); return; }
    setAiGenerating(true);
    try {
      await fetch(`/api/sites/${site.siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandColor: site.brandColor, avatarStyle: aiStyle, logoUrl: logoUrl || null, avatarConfig: { businessType, freeDescription: freeDesc } }),
      });
      const res = await fetch("/api/avatar/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: site.siteId, config: buildAiConfig() }),
      });
      const j = (await res.json()) as { avatarUrl?: string; error?: string };
      if (!res.ok) { push(j.error ?? "No se pudo generar", "error"); return; }
      if (j.avatarUrl) {
        setCurrentImage(j.avatarUrl);
        setIsAiImage(true);
        setGuideSection("saved");
        push("¡Avatar HD generado! ✓", "success");
        router.refresh();
        setTimeout(() => setGuideSection(null), 3500);
      }
    } catch { push("Error de red al generar", "error"); }
    finally { setAiGenerating(false); }
  }

  return (
    <>
      <style>{`
        @keyframes bubblePop {
          0%   { opacity: 0; transform: scale(0.88) translateY(6px); }
          60%  { opacity: 1; transform: scale(1.03) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes avatarEntrance {
          0%   { opacity: 0; transform: scale(0.82); }
          70%  { opacity: 1; transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes guidePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
          50%       { box-shadow: 0 0 0 8px rgba(99,102,241,0.12); }
        }
      `}</style>

      <div className="grid max-w-5xl gap-8 lg:grid-cols-[1fr_280px]">

        {/* ── LEFT: steps ──────────────────────────────────── */}
        <div className="space-y-5">

          {/* Step 1 — Estilo */}
          <div
            className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 transition-colors duration-200 hover:border-[var(--border-default)]"
            onMouseEnter={() => setGuideSection("style")}
            onMouseLeave={() => setGuideSection(null)}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <StepHeader n={1} title="Elegí el estilo" subtitle="12 estilos generados al instante desde tu nombre de agente." />
              <button
                type="button"
                onClick={() => { setSeed(randSeed()); setGuideSection("seed"); }}
                className="shrink-0 flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-overlay)] px-3 py-1.5 text-[11px] text-[var(--text-secondary)] transition-all hover:border-[var(--accent-border)] hover:text-[var(--accent)]"
              >
                <Shuffle className="size-3" />
                Variar
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {STYLES.map((style) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  seed={seed}
                  bg={bg}
                  selected={selectedStyle === style.id}
                  onClick={() => { setSelectedStyle(style.id); setGuideSection("style"); }}
                  onHoverEnter={() => { setHoveredStyle(style.id); setGuideSection("style"); }}
                  onHoverLeave={() => { setHoveredStyle(null); }}
                />
              ))}
            </div>
          </div>

          {/* Step 2 — Fondo */}
          <div
            className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 transition-colors duration-200 hover:border-[var(--border-default)]"
            onMouseEnter={() => setGuideSection("bg")}
            onMouseLeave={() => setGuideSection(null)}
          >
            <StepHeader n={2} title="Color de fondo" subtitle="Elegí el tono que mejor representa tu marca." />
            <div className="flex flex-wrap gap-2">
              {BG_PRESETS.map((preset) => {
                const sel = bg === preset.hex;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    title={preset.label}
                    onClick={() => setBg(preset.hex)}
                    className={`flex size-8 items-center justify-center rounded-full border-2 transition-transform hover:scale-110 ${
                      sel
                        ? "border-[var(--accent)] shadow-[0_0_0_2px_var(--accent)]"
                        : "border-transparent hover:border-[var(--border-default)]"
                    }`}
                    style={
                      preset.hex
                        ? { background: `#${preset.hex}` }
                        : { background: "var(--bg-overlay)", border: "1px dashed var(--border-default)" }
                    }
                  >
                    {sel && (
                      <Check
                        className="size-3.5"
                        style={{
                          color: preset.dark ? "#fff" : "#000",
                          filter: "drop-shadow(0 0 2px rgba(0,0,0,0.4))",
                        }}
                      />
                    )}
                    {!preset.hex && !sel && <span className="text-[10px] text-[var(--text-tertiary)]">∅</span>}
                  </button>
                );
              })}
              <label className="flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] px-2.5 py-1 text-[11px] text-[var(--text-tertiary)] hover:border-[var(--accent-border)] hover:text-[var(--accent)] transition-colors">
                <input
                  type="color"
                  className="sr-only"
                  value={bg ? `#${bg}` : "#ffffff"}
                  onChange={(e) => setBg(e.target.value.replace("#", ""))}
                />
                + Custom
              </label>
            </div>
          </div>

          {/* Step 3 — Variación */}
          <div
            className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 transition-colors duration-200 hover:border-[var(--border-default)]"
            onMouseEnter={() => setGuideSection("seed")}
            onMouseLeave={() => setGuideSection(null)}
          >
            <StepHeader n={3} title="Variación de rasgos" subtitle="La semilla determina cómo me veo. Cambiala para generar variantes." />
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value || randSeed())}
                onFocus={() => setGuideSection("seed")}
                className="dash-input flex-1 font-mono text-[12px]"
                placeholder="semilla del avatar"
              />
              <button
                type="button"
                onClick={() => { setSeed(randSeed()); setGuideSection("seed"); }}
                className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-overlay)] px-3 py-2 text-[12px] text-[var(--text-secondary)] transition-all hover:border-[var(--accent-border)] hover:text-[var(--accent)]"
              >
                <Shuffle className="size-3.5" />
                Nuevo
              </button>
              <button
                type="button"
                onClick={() => setSeed(initialSeed(site))}
                className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                title="Volver al nombre del agente"
              >
                <RefreshCw className="size-3" />
                Reset
              </button>
            </div>
          </div>

          {/* Step 4 — Guardar */}
          <Button
            type="button"
            className="w-full gap-2 min-h-11"
            disabled={saving}
            onClick={() => void handleSaveDicebear()}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {saving ? "Guardando…" : "Usar este avatar"}
          </Button>

          {/* Step 5 — AI (Pro) */}
          <div
            className="rounded-[var(--radius-xl)] border border-[rgba(168,85,247,0.25)] bg-[rgba(168,85,247,0.04)] p-5 space-y-4"
            onMouseEnter={() => setGuideSection("ai")}
            onMouseLeave={() => setGuideSection(null)}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-purple-400" />
              <h3 className="font-syne text-[13px] font-bold text-[var(--text-primary)]">Generación HD con IA</h3>
              <span className="rounded-full border border-purple-500/30 bg-purple-500/08 px-2 py-0.5 text-[10px] font-semibold text-purple-400">Pro</span>
            </div>
            <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed">
              Imagen fotorrealista o ilustrada generada por Flux AI con tu paleta de marca.
              Cada agente tiene <strong className="text-[var(--text-primary)]">3 generaciones</strong>.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {([
                { v: "cartoon",   label: "Ilustrado", icon: "🎨" },
                { v: "realistic", label: "Realista",   icon: "📸" },
                { v: "object",    label: "Mascota",    icon: "🧸" },
              ] as const).map((s) => (
                <button
                  key={s.v}
                  type="button"
                  onClick={() => setAiStyle(s.v)}
                  className={`flex items-center gap-2 rounded-[var(--radius-md)] border p-2.5 text-left transition-all ${
                    aiStyle === s.v
                      ? "border-purple-500/50 bg-purple-500/08 text-[var(--text-primary)]"
                      : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)]"
                  }`}
                >
                  <span className="text-base">{s.icon}</span>
                  <span className="text-[11px] font-medium">{s.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[var(--text-tertiary)]">¿Qué hace tu empresa?</label>
              <input
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="veterinaria, e-commerce de moda, SaaS de RRHH…"
                className="dash-input w-full text-[12px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[var(--text-tertiary)]">Detalles extra (opcional)</label>
              <textarea
                value={freeDesc}
                onChange={(e) => setFreeDesc(e.target.value)}
                placeholder="Tono, accesorios, edad aproximada, estética…"
                rows={2}
                className="dash-input w-full resize-y text-[12px]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-[var(--text-tertiary)]">Logo (opcional)</label>
              <div className="flex items-center gap-2">
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="size-8 rounded border border-[var(--border-subtle)] object-contain bg-[var(--bg-surface)] p-0.5" />
                )}
                <input ref={logoInputRef} type="file" accept="image/*" className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleLogoUpload(f); }} />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoUploading}
                  className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--bg-overlay)] px-3 py-2 text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[rgba(168,85,247,0.5)] hover:text-purple-400"
                >
                  {logoUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  {logoUrl ? "Cambiar" : "Subir logo"}
                </button>
                {logoUrl && (
                  <button type="button" onClick={() => setLogoUrl("")} className="text-[11px] text-[var(--text-tertiary)] hover:text-[#f87171]">Quitar</button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                disabled={aiGenerating || genLeft <= 0}
                onClick={() => void handleAiGenerate()}
                className="w-full gap-2"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
              >
                {aiGenerating
                  ? <><Loader2 className="size-4 animate-spin" />Generando… 15–30s</>
                  : <><Sparkles className="size-4" />Generar avatar HD ({genLeft}/3)</>}
              </Button>
              <button
                type="button"
                disabled={aiPreviewing || aiGenerating}
                onClick={() => void handleAiPreview()}
                className="w-full text-center text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors disabled:opacity-40"
              >
                {aiPreviewing ? "Generando preview…" : "Preview rápido (no se guarda)"}
              </button>
            </div>

            {genLeft === 0 && (
              <p className="text-[11px] text-[#f87171]">Ya usaste las 3 generaciones de IA para este agente.</p>
            )}
          </div>
        </div>

        {/* ── RIGHT: sticky guide ───────────────────────────── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-4">

            {/* Guide card */}
            <div
              className="relative overflow-hidden rounded-[var(--radius-xl)] border bg-[var(--bg-elevated)]"
              style={{
                borderColor: guideSection === "saved" ? "rgba(52,211,153,0.4)" : "var(--border-subtle)",
                transition: "border-color 0.4s ease",
              }}
            >
              {/* Ambient glow based on brand color */}
              <div
                className="absolute inset-x-0 top-0 h-24 opacity-20 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, ${site.brandColor} 0%, transparent 70%)`,
                }}
              />

              <div className="relative flex flex-col items-center px-5 pt-6 pb-5 gap-4">

                {/* Speech bubble */}
                <SpeechBubble message={guideMessage} />

                {/* Avatar */}
                <div
                  className="relative"
                  style={{ animation: "avatarEntrance 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}
                  key={`${isAiImage ? "ai" : previewStyle}-${seed}-${bg}`}
                >
                  <div
                    className="flex size-36 items-center justify-center overflow-hidden rounded-full"
                    style={{
                      background: bg
                        ? `#${bg}`
                        : `linear-gradient(135deg, ${site.brandColor}22, ${site.brandColor2}22)`,
                      border: `2.5px solid ${site.brandColor}50`,
                      boxShadow: `0 0 0 6px ${site.brandColor}12, 0 16px 48px rgba(0,0,0,0.4)`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={isAiImage && currentImage ? currentImage : dicebearPreviewUrl}
                      alt="Avatar"
                      className="size-full object-cover rounded-full"
                    />
                  </div>
                  {/* Online dot */}
                  <div className="absolute bottom-2 right-2 size-4 rounded-full border-2 border-[var(--bg-elevated)] bg-emerald-500" />
                </div>

                {/* Name + style */}
                <div className="text-center">
                  <p className="font-syne text-[15px] font-bold text-[var(--text-primary)]">{site.agentName}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--text-tertiary)]">
                    {isAiImage
                      ? "Generado con IA ✨"
                      : `${previewStyleInfo.emoji} ${previewStyleInfo.label}`}
                  </p>
                  {hoveredStyle && hoveredStyle !== selectedStyle && (
                    <p className="mt-1 text-[10px] text-[var(--accent)]">Click para seleccionar</p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex w-full flex-col gap-2">
                  <Button
                    type="button"
                    className="w-full gap-2"
                    disabled={saving}
                    onClick={() => void handleSaveDicebear()}
                  >
                    {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                    {saving ? "Guardando…" : guideSection === "saved" ? "¡Guardado! 🎉" : "Usar este avatar"}
                  </Button>
                  {isAiImage && (
                    <button
                      type="button"
                      onClick={() => { setIsAiImage(false); setGuideSection(null); }}
                      className="flex items-center justify-center gap-1 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                    >
                      <RefreshCw className="size-3" />
                      Volver a DiceBear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Widget mockup */}
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
              <div className="px-2.5 py-1.5 border-b border-[var(--border-subtle)]">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">Vista previa widget</p>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--border-subtle)]"
                style={{ background: `color-mix(in srgb, ${site.brandColor} 6%, transparent)` }}
              >
                <div
                  className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full"
                  style={{ background: `${site.brandColor}20`, border: `1px solid ${site.brandColor}40` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={isAiImage && currentImage ? currentImage : dicebearPreviewUrl}
                    alt=""
                    className="size-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <p className="font-syne text-[11px] font-bold text-[var(--text-primary)]">{site.agentName}</p>
                  <div className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] text-[var(--text-tertiary)]">En línea</span>
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5">
                  <p className="text-[10px] text-[var(--text-primary)]">¡Hola! ¿En qué te puedo ayudar?</p>
                </div>
                <div className="max-w-[75%] ml-auto rounded-2xl rounded-tr-sm px-2.5 py-1.5" style={{ background: site.brandColor }}>
                  <p className="text-[10px] text-white">¿Cuánto cuesta el plan Pro?</p>
                </div>
              </div>
            </div>

            {/* Style info */}
            <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3">
              <p className="text-[11px] font-semibold text-[var(--text-primary)]">
                {previewStyleInfo.emoji} {previewStyleInfo.label}
              </p>
              <p className="mt-0.5 text-[10px] text-[var(--text-tertiary)]">{previewStyleInfo.desc}</p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
