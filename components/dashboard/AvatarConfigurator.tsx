"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useProductToast } from "@/components/providers/product-toast";
import { Button } from "@/components/ui/button";
import { describeSiteCharacter } from "@/lib/avatar-config";
import type { AvatarConfig } from "@/lib/avatar-config";
import { Sparkles, Upload, Loader2, RefreshCw, Check } from "lucide-react";

const AvatarCanvas = dynamic(() => import("@/components/avatar/AvatarCanvas"), {
  ssr: false,
  loading: () => <div className="size-full rounded-full bg-[var(--bg-overlay)] shimmer" />,
});

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

/* ── Data ─────────────────────────────────────────────────── */

const CHARACTERS = [
  { type: "human", subtype: "male",   emoji: "👨", label: "Hombre" },
  { type: "human", subtype: "female", emoji: "👩", label: "Mujer"  },
] as const;

const STYLES: { value: AvatarConfig["style"]; label: string; desc: string; icon: string }[] = [
  { value: "cartoon",   label: "Ilustrado",  desc: "Colorido y amigable",   icon: "🎨" },
  { value: "realistic", label: "Realista",   desc: "Fotorrealista, serio",  icon: "📸" },
  { value: "object",    label: "Mascota",    desc: "Objeto o animal 3D",    icon: "🧸" },
];

const BRAND_SWATCHES = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f97316",
  "#10b981", "#0ea5e9", "#f43f5e", "#eab308",
];

/* ── Helpers ──────────────────────────────────────────────── */

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="flex size-5 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-white">
        {n}
      </span>
      <h3 className="font-syne text-[13px] font-bold text-[var(--text-primary)]">{label}</h3>
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
      {children}
    </div>
  );
}

/* ── Component ────────────────────────────────────────────── */

export default function AvatarConfigurator({ site }: { site: SiteData }) {
  const router = useRouter();
  const { push } = useProductToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const cfg = site.avatarConfig as { businessType?: string; freeDescription?: string } | null;

  const [avatarType, setAvatarType]       = useState(site.avatarType    ?? "human");
  const [avatarSubtype, setAvatarSubtype] = useState(site.avatarSubtype ?? "male");
  const [avatarStyle, setAvatarStyle]     = useState<AvatarConfig["style"]>(
    (site.avatarStyle as AvatarConfig["style"]) || "cartoon",
  );
  const [brandColor, setBrandColor]   = useState(site.brandColor);
  const [brandColor2, setBrandColor2] = useState(site.brandColor2);
  const [logoUrl, setLogoUrl]         = useState(site.logoUrl ?? "");
  const [logoUploading, setLogoUploading] = useState(false);
  const [businessType, setBusinessType]   = useState(cfg?.businessType?.trim() || "");
  const [freeDescription, setFreeDescription] = useState(cfg?.freeDescription ?? "");
  const [isTalking, setIsTalking] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(site.avatarImageUrl ?? null);

  const genUsed = site.avatarGenerations;
  const genLeft = Math.max(0, 3 - genUsed);

  function buildConfig(): AvatarConfig {
    return {
      style: avatarStyle,
      businessType: (businessType.trim() || site.name),
      characterType: describeSiteCharacter({ avatarType, avatarSubtype }),
      brandColor,
      brandColor2: brandColor2 || undefined,
      logoUrl: logoUrl.trim() || undefined,
      agentName: site.agentName,
      freeDescription: freeDescription.trim() || undefined,
    };
  }

  async function save() {
    const res = await fetch(`/api/sites/${site.siteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        avatarType, avatarSubtype, brandColor, brandColor2,
        logoUrl: logoUrl || null, avatarStyle,
        avatarConfig: {
          ...((site.avatarConfig as object) || {}),
          businessType: businessType.trim() || site.name,
          freeDescription: freeDescription.trim() || undefined,
        },
      }),
    });
    return res.ok;
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

  async function handlePreview() {
    setPreviewing(true);
    try {
      const res = await fetch("/api/avatar/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: buildConfig() }),
      });
      const j = (await res.json()) as { previewUrl?: string; error?: string };
      if (!res.ok) { push(j.error ?? "Preview no disponible", "error"); return; }
      if (j.previewUrl) { setPreviewUrl(j.previewUrl); push("Preview lista", "success"); }
    } catch { push("Error de red", "error"); }
    finally { setPreviewing(false); }
  }

  async function handleGenerate() {
    if (genLeft <= 0) { push("Ya usaste las 3 generaciones para este agente.", "warning"); return; }
    setGenerating(true);
    try {
      if (!(await save())) { push("Error al guardar antes de generar.", "error"); return; }
      const res = await fetch("/api/avatar/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: site.siteId, config: buildConfig() }),
      });
      const j = (await res.json()) as { avatarUrl?: string; error?: string };
      if (!res.ok) { push(j.error ?? "No se pudo generar", "error"); return; }
      if (j.avatarUrl) {
        setPreviewUrl(j.avatarUrl);
        push("¡Avatar generado y guardado! ✓", "success");
        router.refresh();
      }
    } catch { push("Error de red al generar", "error"); }
    finally { setGenerating(false); }
  }

  const selectedChar = CHARACTERS.find(
    (c) => c.type === avatarType && c.subtype === avatarSubtype,
  ) ?? CHARACTERS[0];

  return (
    <div className="grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]">

      {/* ── Left: config steps ──────────────────────── */}
      <div className="space-y-5">

        {/* Step 1: personaje */}
        <Section>
          <StepLabel n={1} label="Elegí el personaje" />
          <p className="mb-3 text-[12px] text-[var(--text-secondary)]">
            La IA genera una persona con remera del color de tu marca y el logo en el pecho.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-[280px]">
            {CHARACTERS.map((c) => {
              const sel = avatarType === c.type && avatarSubtype === c.subtype;
              return (
                <button
                  key={`${c.type}-${c.subtype}`}
                  type="button"
                  onClick={() => { setAvatarType(c.type); setAvatarSubtype(c.subtype); }}
                  className={`flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] border py-3 transition-all ${
                    sel
                      ? "border-[var(--accent)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent)]"
                      : "border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-overlay)]"
                  }`}
                >
                  <span className="text-4xl leading-none">{c.emoji}</span>
                  <span className={`text-[13px] font-semibold ${sel ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}>
                    {c.label}
                  </span>
                  {sel && <Check className="size-3.5 text-[var(--accent)]" />}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Step 2: colores + logo */}
        <Section>
          <StepLabel n={2} label="Colores y logo" />
          <div className="space-y-5">
            {/* Color primario */}
            <div>
              <p className="mb-2 text-[11px] font-medium text-[var(--text-tertiary)]">Color primario</p>
              <div className="flex flex-wrap items-center gap-2">
                {BRAND_SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBrandColor(c)}
                    className="relative size-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      background: c,
                      borderColor: brandColor === c ? "white" : "transparent",
                      boxShadow: brandColor === c ? `0 0 0 2px ${c}` : "none",
                    }}
                    title={c}
                  >
                    {brandColor === c && (
                      <Check className="absolute inset-0 m-auto size-3.5 text-white drop-shadow" />
                    )}
                  </button>
                ))}
                <label className="relative cursor-pointer">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="sr-only"
                  />
                  <span className="flex size-7 items-center justify-center rounded-full border border-dashed border-[var(--border-default)] bg-[var(--bg-overlay)] text-[11px] text-[var(--text-tertiary)] hover:border-[var(--border-default)] transition-colors">
                    +
                  </span>
                </label>
                <div
                  className="size-7 rounded-full border-2 border-[var(--border-subtle)] ml-1"
                  style={{ background: brandColor }}
                />
                <span className="font-mono text-[11px] text-[var(--text-tertiary)]">{brandColor}</span>
              </div>
            </div>

            {/* Color secundario */}
            <div>
              <p className="mb-2 text-[11px] font-medium text-[var(--text-tertiary)]">Color secundario (gradiente)</p>
              <div className="flex flex-wrap items-center gap-2">
                {BRAND_SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBrandColor2(c)}
                    className="relative size-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      background: c,
                      borderColor: brandColor2 === c ? "white" : "transparent",
                      boxShadow: brandColor2 === c ? `0 0 0 2px ${c}` : "none",
                    }}
                    title={c}
                  >
                    {brandColor2 === c && (
                      <Check className="absolute inset-0 m-auto size-3.5 text-white drop-shadow" />
                    )}
                  </button>
                ))}
                <label className="relative cursor-pointer">
                  <input
                    type="color"
                    value={brandColor2}
                    onChange={(e) => setBrandColor2(e.target.value)}
                    className="sr-only"
                  />
                  <span className="flex size-7 items-center justify-center rounded-full border border-dashed border-[var(--border-default)] bg-[var(--bg-overlay)] text-[11px] text-[var(--text-tertiary)] hover:border-[var(--border-default)] transition-colors">
                    +
                  </span>
                </label>
                <div
                  className="size-7 rounded-full border-2 border-[var(--border-subtle)] ml-1"
                  style={{ background: brandColor2 }}
                />
              </div>
            </div>

            {/* Logo */}
            <div>
              <p className="mb-2 text-[11px] font-medium text-[var(--text-tertiary)]">Logo (opcional)</p>
              <div className="flex items-center gap-3">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="size-10 rounded-lg border border-[var(--border-subtle)] object-contain bg-[var(--bg-surface)] p-1"
                  />
                )}
                <input ref={logoInputRef} type="file" accept="image/*" className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleLogoUpload(f); }} />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoUploading}
                  className="flex items-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--bg-overlay)] px-4 py-2.5 text-[12px] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-border)] hover:text-[var(--accent)]"
                >
                  {logoUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  {logoUrl ? "Cambiar logo" : "Subir logo"}
                </button>
                {logoUrl && (
                  <button type="button" onClick={() => setLogoUrl("")}
                    className="text-[11px] text-[var(--text-tertiary)] hover:text-[#f87171] transition-colors">
                    Quitar
                  </button>
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* Step 3: descripción */}
        <Section>
          <StepLabel n={3} label="Describí tu negocio" />
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-[var(--text-tertiary)]">
                ¿Qué hace tu empresa?
              </label>
              <input
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="Ej: veterinaria, e-commerce de moda, SaaS de RRHH…"
                className="dash-input w-full"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-[var(--text-tertiary)]">
                Detalles extra para la IA (opcional)
              </label>
              <textarea
                value={freeDescription}
                onChange={(e) => setFreeDescription(e.target.value)}
                placeholder="Tono del personaje, accesorios, edad aproximada, estética que te gusta…"
                rows={3}
                className="dash-input w-full resize-y min-h-[80px]"
              />
            </div>
          </div>
        </Section>

        {/* Step 4: estilo */}
        <Section>
          <StepLabel n={4} label="Estilo de imagen" />
          <div className="grid gap-2 sm:grid-cols-3">
            {STYLES.map((s) => {
              const sel = avatarStyle === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setAvatarStyle(s.value)}
                  className={`flex items-start gap-3 rounded-[var(--radius-md)] border p-3.5 text-left transition-all ${
                    sel
                      ? "border-[var(--accent)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent)]"
                      : "border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-overlay)]"
                  }`}
                >
                  <span className="mt-0.5 text-xl leading-none">{s.icon}</span>
                  <div>
                    <p className={`text-[13px] font-semibold ${sel ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>
                      {s.label}
                    </p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">{s.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Save */}
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={async () => { if (await save()) push("Configuración guardada", "success"); else push("Error al guardar", "error"); }}
        >
          Guardar configuración
        </Button>
      </div>

      {/* ── Right: preview ──────────────────────────── */}
      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">

        {/* Avatar preview card */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 text-center">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
            Vista previa
          </p>

          {/* Image / canvas */}
          <div className="mx-auto mb-4 relative" style={{ width: 160, height: 160 }}>
            <div
              className="flex size-40 items-center justify-center overflow-hidden rounded-full"
              style={{
                background: `linear-gradient(135deg, ${brandColor}22, ${brandColor2}22)`,
                border: `2px solid ${brandColor}40`,
              }}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Avatar" className="size-full rounded-full object-cover" />
              ) : (
                <AvatarCanvas
                  config={{ type: avatarType, subtype: avatarSubtype, brandColor, brandColor2, size: 160, isTalking }}
                  size={160}
                />
              )}
            </div>
            {/* Online dot */}
            <div className="absolute bottom-2 right-2 size-4 rounded-full border-2 border-[var(--bg-elevated)] bg-emerald-500" />
          </div>

          <p className="font-syne text-[15px] font-bold text-[var(--text-primary)]">{site.agentName}</p>
          <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">{selectedChar.emoji} {selectedChar.label}</p>

          {/* Talk toggle */}
          <button
            type="button"
            onClick={() => setIsTalking((v) => !v)}
            className="mt-3 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {isTalking ? "⏸ Detener" : "▶ Animar"}
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="mt-1 flex items-center gap-1 mx-auto text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <RefreshCw className="size-3" />
              Volver a 2D
            </button>
          )}
        </div>

        {/* Generate button */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--accent-border)] bg-[var(--accent-subtle)] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold text-[var(--text-primary)]">Generar con IA</p>
            <span className={`text-[11px] font-medium ${genLeft === 0 ? "text-[#f87171]" : "text-[var(--text-tertiary)]"}`}>
              {genLeft} generación{genLeft !== 1 ? "es" : ""} disponible{genLeft !== 1 ? "s" : ""}
            </span>
          </div>

          <Button
            type="button"
            className="w-full gap-2"
            disabled={generating || genLeft <= 0}
            onClick={() => void handleGenerate()}
          >
            {generating ? (
              <><Loader2 className="size-4 animate-spin" />Generando… puede tomar 10–20s</>
            ) : (
              <><Sparkles className="size-4" />Generar avatar HD</>
            )}
          </Button>

          <button
            type="button"
            className="w-full text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors disabled:opacity-40"
            disabled={previewing || generating}
            onClick={() => void handlePreview()}
          >
            {previewing ? "Generando preview…" : "Preview rápido (sin guardar)"}
          </button>

          <p className="text-[10px] leading-relaxed text-[var(--text-tertiary)]">
            La imagen HD se guarda y aparece en el widget de tu sitio. Cada agente tiene 3 generaciones.
          </p>
        </div>

        {/* Mini widget mockup */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[var(--border-subtle)]"
            style={{ background: `color-mix(in srgb, ${brandColor} 6%, transparent)` }}
          >
            <div
              className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full"
              style={{ background: `${brandColor}20`, border: `1px solid ${brandColor}40` }}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="" className="size-full object-cover" />
              ) : (
                <AvatarCanvas
                  config={{ type: avatarType, subtype: avatarSubtype, brandColor, brandColor2, size: 28 }}
                  size={28}
                />
              )}
            </div>
            <div>
              <p className="font-syne text-[12px] font-bold text-[var(--text-primary)]">{site.agentName}</p>
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-[var(--text-tertiary)]">En línea</span>
              </div>
            </div>
          </div>
          <div className="p-3 space-y-2">
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
              <p className="text-[11px] text-[var(--text-primary)]">¡Hola! ¿En qué te puedo ayudar?</p>
            </div>
            <div className="max-w-[75%] ml-auto rounded-2xl rounded-tr-sm px-3 py-2" style={{ background: brandColor }}>
              <p className="text-[11px] text-white">¿Cuánto cuesta el plan Pro?</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
