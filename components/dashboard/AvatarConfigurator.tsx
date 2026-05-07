"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProductToast } from "@/components/providers/product-toast";
import { Button } from "@/components/ui/button";
import { describeSiteCharacter } from "@/lib/avatar-config";
import type { AvatarConfig } from "@/lib/avatar-config";

const AvatarCanvas = dynamic(() => import("@/components/avatar/AvatarCanvas"), {
  ssr: false,
  loading: () => (
    <div className="size-[160px] rounded-full bg-[var(--bg-overlay)] shimmer" />
  ),
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

const AVATAR_TYPES = [
  { value: "human", label: "Humano ♂", subtype: "male", emoji: "👨" },
  { value: "human", label: "Humano ♀", subtype: "female", emoji: "👩" },
  { value: "animal", label: "Perro", subtype: "perro", emoji: "🐶" },
  { value: "animal", label: "Gato", subtype: "gato", emoji: "🐱" },
  { value: "object", label: "Naranja", subtype: "naranja", emoji: "🍊" },
  { value: "object", label: "Taza", subtype: "taza", emoji: "☕" },
  { value: "object", label: "Estrella", subtype: "estrella", emoji: "⭐" },
];

const STYLES: { value: AvatarConfig["style"]; label: string; hint: string }[] = [
  { value: "realistic", label: "Realista", hint: "FLUX Pro · ~8s" },
  { value: "cartoon", label: "Cartoon", hint: "Schnell · rápido" },
  { value: "object", label: "Objeto / mascota", hint: "FLUX Pro" },
];

const panel = "rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]";

export default function AvatarConfigurator({ site }: { site: SiteData }) {
  const router = useRouter();
  const { push } = useProductToast();
  const cfg = site.avatarConfig as { businessType?: string; freeDescription?: string } | null;

  const [avatarType, setAvatarType] = useState(site.avatarType ?? "human");
  const [avatarSubtype, setAvatarSubtype] = useState(site.avatarSubtype ?? "male");
  const [avatarStyle, setAvatarStyle] = useState<AvatarConfig["style"]>(
    (site.avatarStyle as AvatarConfig["style"]) || "cartoon",
  );
  const [brandColor, setBrandColor] = useState(site.brandColor);
  const [brandColor2, setBrandColor2] = useState(site.brandColor2);
  const [logoUrl, setLogoUrl] = useState(site.logoUrl ?? "");
  const [businessType, setBusinessType] = useState(cfg?.businessType?.trim() || site.name || "");
  const [freeDescription, setFreeDescription] = useState(cfg?.freeDescription ?? "");
  const [isTalking, setIsTalking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const generationsUsed = site.avatarGenerations;
  const generationsLeft = Math.max(0, 3 - generationsUsed);

  function buildConfig(): AvatarConfig {
    return {
      style: avatarStyle,
      businessType: businessType.trim() || site.name,
      characterType: describeSiteCharacter({ avatarType, avatarSubtype }),
      brandColor,
      brandColor2: brandColor2 || undefined,
      logoUrl: logoUrl.trim() || undefined,
      agentName: site.agentName,
      freeDescription: freeDescription.trim() || undefined,
    };
  }

  async function persistConfig(): Promise<boolean> {
    try {
      const res = await fetch(`/api/sites/${site.siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarType,
          avatarSubtype,
          brandColor,
          brandColor2,
          logoUrl: logoUrl || null,
          avatarStyle,
          avatarConfig: {
            ...((site.avatarConfig as object) || {}),
            businessType: businessType.trim() || site.name,
            freeDescription: freeDescription.trim() || undefined,
          },
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const ok = await persistConfig();
      if (ok) {
        push("Configuración guardada", "success");
        router.refresh();
      } else {
        push("No se pudo guardar", "error");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview() {
    setPreviewing(true);
    setPreviewUrl(null);
    try {
      const res = await fetch("/api/avatar/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: buildConfig() }),
      });
      const j = (await res.json()) as { previewUrl?: string; error?: string };
      if (!res.ok) {
        push(j.error ?? "Preview no disponible", "error");
        return;
      }
      if (j.previewUrl) {
        setPreviewUrl(j.previewUrl);
        push("Preview lista (estilo cartoon rápido)", "success");
      }
    } catch {
      push("Error de red en preview", "error");
    } finally {
      setPreviewing(false);
    }
  }

  async function handleGenerateAi() {
    if (generationsLeft <= 0) {
      push("Ya usaste las 3 generaciones para este agente.", "warning");
      return;
    }
    setGenerating(true);
    try {
      const saved = await persistConfig();
      if (!saved) {
        push("Guardá la configuración antes de generar.", "error");
        return;
      }
      const res = await fetch("/api/avatar/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: site.siteId,
          config: buildConfig(),
        }),
      });
      const j = (await res.json()) as { success?: boolean; avatarUrl?: string; error?: string; generationsRemaining?: number };
      if (!res.ok) {
        push(j.error ?? "No se pudo generar el avatar", "error");
        return;
      }
      if (j.avatarUrl) {
        push("Avatar generado y guardado ✓", "success");
        router.refresh();
      }
    } catch {
      push("Error de red al generar", "error");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="grid max-w-4xl gap-8 md:grid-cols-2">
      <div className="space-y-6">
        <div className={`${panel} space-y-4`}>
          <h2 className="font-syne text-base font-bold text-[var(--text-primary)]">Estilo de imagen (IA)</h2>
          <p className="text-xs text-[var(--text-tertiary)]">
            GPT-4o arma el prompt;{" "}
            <strong className="text-[var(--text-secondary)]">realista / objeto</strong> usan FLUX Pro,{" "}
            <strong className="text-[var(--text-secondary)]">cartoon</strong> usa Schnell.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {STYLES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setAvatarStyle(s.value)}
                className={`rounded-[var(--radius-md)] border px-3 py-2.5 text-left text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] ${
                  avatarStyle === s.value
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--text-primary)]"
                    : "border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:border-[var(--border-default)]"
                }`}
              >
                <span className="font-semibold">{s.label}</span>
                <span className="mt-0.5 block text-[10px] text-[var(--text-tertiary)]">{s.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={`${panel} space-y-4`}>
          <h2 className="font-syne text-base font-bold text-[var(--text-primary)]">Tipo de avatar (preview 2D)</h2>
          <div className="grid grid-cols-3 gap-2">
            {AVATAR_TYPES.map((t) => {
              const sel = avatarType === t.value && avatarSubtype === t.subtype;
              return (
                <button
                  key={`${t.value}-${t.subtype}`}
                  type="button"
                  onClick={() => {
                    setAvatarType(t.value);
                    setAvatarSubtype(t.subtype);
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] border p-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] ${
                    sel
                      ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--text-primary)]"
                      : "border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:border-[var(--border-default)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`${panel} space-y-4`}>
          <h2 className="font-syne text-base font-bold text-[var(--text-primary)]">Identidad para el prompt</h2>
          <div>
            <label className="mb-2 block text-xs font-medium text-[var(--text-tertiary)]">Tipo de negocio</label>
            <input
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              placeholder="Ej. veterinaria, concesionaria, SaaS B2B…"
              className="dash-input w-full"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-[var(--text-tertiary)]">Descripción libre (opcional)</label>
            <textarea
              value={freeDescription}
              onChange={(e) => setFreeDescription(e.target.value)}
              placeholder="Detalles para la IA: tono, edad aproximada, accesorios, etc."
              rows={3}
              className="dash-input min-h-[88px] w-full resize-y"
            />
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--text-tertiary)]">
            Personaje técnico en inglés para FLUX:{" "}
            <span className="font-mono text-[10px] text-[var(--text-secondary)]">{describeSiteCharacter({ avatarType, avatarSubtype })}</span>
          </p>
        </div>

        <div className={`${panel} space-y-4`}>
          <h2 className="font-syne text-base font-bold text-[var(--text-primary)]">Identidad visual</h2>
          <div>
            <label className="mb-2 block text-xs font-medium text-[var(--text-tertiary)]">Color primario</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="size-10 shrink-0 cursor-pointer rounded-[var(--radius-md)] border border-[var(--border-default)] bg-transparent"
              />
              <input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="dash-input flex-1 font-mono text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-[var(--text-tertiary)]">Color secundario</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={brandColor2}
                onChange={(e) => setBrandColor2(e.target.value)}
                className="size-10 shrink-0 cursor-pointer rounded-[var(--radius-md)] border border-[var(--border-default)] bg-transparent"
              />
              <input value={brandColor2} onChange={(e) => setBrandColor2(e.target.value)} className="dash-input flex-1 font-mono text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-[var(--text-tertiary)]">URL del logo (opcional)</label>
            <input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://tuempresa.com/logo.png"
              className="dash-input w-full"
            />
            <p className="mt-1 text-[10px] text-[var(--text-tertiary)]">Se compone abajo del avatar en la imagen final (sharp).</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button type="button" className="w-full" size="lg" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Guardando…" : "Guardar configuración"}
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              disabled={previewing || generating}
              onClick={() => void handlePreview()}
            >
              {previewing ? "Preview…" : "Preview rápido (IA)"}
            </Button>
            <Button
              type="button"
              className="flex-1 gap-2"
              disabled={generating || previewing || generationsLeft <= 0}
              onClick={() => void handleGenerateAi()}
            >
              {generating ? "Generando…" : "Generar y guardar HD"}
            </Button>
          </div>
          <p className="text-center text-[11px] text-[var(--text-tertiary)]">
            Generaciones usadas: {generationsUsed} / 3 · Restantes: {generationsLeft}. Necesitás FAL_KEY + Cloudinary + OpenAI.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className={`${panel} flex w-full flex-col items-center gap-4`}>
          <h2 className="w-full self-start font-syne text-base font-bold text-[var(--text-primary)]">Imagen IA (widget)</h2>
          {site.avatarImageUrl ? (
            <img
              src={site.avatarImageUrl}
              alt="Avatar generado"
              className="size-40 rounded-full border-2 border-[var(--border-default)] object-cover shadow-[var(--shadow-md)]"
            />
          ) : previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="size-40 rounded-full border-2 border-dashed border-[var(--accent-border)] object-cover"
            />
          ) : null}
          <h2 className="w-full self-start font-syne text-sm font-bold text-[var(--text-secondary)]">Preview 2D (canvas)</h2>
          <div className="relative">
            <div
              className="flex size-40 items-center justify-center overflow-hidden rounded-full"
              style={{ background: `${brandColor}18`, border: `2px solid ${brandColor}40` }}
            >
              <AvatarCanvas
                config={{
                  type: avatarType,
                  subtype: avatarSubtype,
                  brandColor,
                  brandColor2,
                  logoUrl: logoUrl || undefined,
                  isTalking,
                  size: 160,
                }}
                size={160}
              />
            </div>
            <div
              className="absolute bottom-1 right-1 size-5 rounded-full border-2 border-[var(--bg-surface)] bg-emerald-500"
              aria-hidden
            />
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsTalking(!isTalking)}
            className={isTalking ? "border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent)]" : ""}
          >
            {isTalking ? "⏸ Detener animación" : "▶ Simular hablando"}
          </Button>

          <p className="text-center text-xs text-[var(--text-tertiary)]">
            El widget puede usar la imagen IA si está generada; el canvas es la vista vectorial animada.
          </p>
        </div>

        <div className={`${panel} w-full space-y-3`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Vista en el widget</p>
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full"
              style={{ background: `${brandColor}18`, border: `1px solid ${brandColor}40` }}
            >
              {site.avatarImageUrl ? (
                <img src={site.avatarImageUrl} alt="" className="size-full object-cover" />
              ) : (
                <AvatarCanvas
                  config={{ type: avatarType, subtype: avatarSubtype, brandColor, brandColor2, size: 40 }}
                  size={40}
                />
              )}
            </div>
            <div>
              <p className="font-syne text-sm font-bold text-[var(--text-primary)]">{site.agentName}</p>
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-[var(--text-tertiary)]">En línea</span>
              </div>
            </div>
          </div>
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[var(--bg-elevated)] px-3 py-2">
            <p className="text-xs text-[var(--text-primary)]">¡Hola! ¿En qué te puedo ayudar?</p>
          </div>
          <div className="max-w-[85%] ml-auto rounded-2xl rounded-tr-sm px-3 py-2" style={{ background: brandColor }}>
            <p className="text-xs text-white">¿Cuánto cuesta?</p>
          </div>
        </div>
      </div>
    </div>
  );
}
