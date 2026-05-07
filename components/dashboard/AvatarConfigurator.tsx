"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProductToast } from "@/components/providers/product-toast";
import { Button } from "@/components/ui/button";

const AvatarCanvas = dynamic(() => import("@/components/avatar/AvatarCanvas"), {
  ssr: false,
  loading: () => (
    <div className="size-[160px] rounded-full bg-[var(--bg-overlay)] shimmer" />
  ),
});

interface SiteData {
  siteId: string;
  plan: string;
  avatarType: string | null;
  avatarSubtype: string | null;
  brandColor: string;
  brandColor2: string;
  logoUrl: string | null;
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

const panel = "rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]";

export default function AvatarConfigurator({ site }: { site: SiteData }) {
  const router = useRouter();
  const { push } = useProductToast();
  const [avatarType, setAvatarType] = useState(site.avatarType ?? "human");
  const [avatarSubtype, setAvatarSubtype] = useState(site.avatarSubtype ?? "male");
  const [brandColor, setBrandColor] = useState(site.brandColor);
  const [brandColor2, setBrandColor2] = useState(site.brandColor2);
  const [logoUrl, setLogoUrl] = useState(site.logoUrl ?? "");
  const [isTalking, setIsTalking] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
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
        }),
      });
      if (res.ok) {
        push("Avatar guardado", "success");
        router.refresh();
      } else {
        push("No se pudo guardar el avatar", "error");
      }
    } catch {
      push("Error de red", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid max-w-4xl gap-8 md:grid-cols-2">
      <div className="space-y-6">
        <div className={`${panel} space-y-4`}>
          <h2 className="font-syne text-base font-bold text-[var(--text-primary)]">Tipo de avatar</h2>
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
          </div>
        </div>

        <Button type="button" className="w-full" size="lg" onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Guardando…" : "Guardar avatar"}
        </Button>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className={`${panel} flex w-full flex-col items-center gap-4`}>
          <h2 className="w-full self-start font-syne text-base font-bold text-[var(--text-primary)]">Preview</h2>

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
            El avatar parpadea, respira y sincroniza la boca cuando habla.
          </p>
        </div>

        <div className={`${panel} w-full space-y-3`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Vista en el widget</p>
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full"
              style={{ background: `${brandColor}18`, border: `1px solid ${brandColor}40` }}
            >
              <AvatarCanvas
                config={{ type: avatarType, subtype: avatarSubtype, brandColor, brandColor2, size: 40 }}
                size={40}
              />
            </div>
            <div>
              <p className="font-syne text-sm font-bold text-[var(--text-primary)]">Agente</p>
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
