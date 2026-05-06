"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const AvatarCanvas = dynamic(() => import("@/components/avatar/AvatarCanvas"), {
  ssr: false,
  loading: () => <div className="w-[160px] h-[160px] rounded-full bg-[#1a1a1a] shimmer" />,
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

export default function AvatarConfigurator({ site }: { site: SiteData }) {
  const router = useRouter();
  const [avatarType, setAvatarType] = useState(site.avatarType ?? "human");
  const [avatarSubtype, setAvatarSubtype] = useState(site.avatarSubtype ?? "male");
  const [brandColor, setBrandColor] = useState(site.brandColor);
  const [brandColor2, setBrandColor2] = useState(site.brandColor2);
  const [logoUrl, setLogoUrl] = useState(site.logoUrl ?? "");
  const [isTalking, setIsTalking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full bg-[#0e0e0e] border border-[#222] text-[#F0EDE8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-[#444]";

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
      {/* Left — Controls */}
      <div className="space-y-6">
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 space-y-4">
          <h2 className="font-syne font-bold text-base text-[#F0EDE8]">Tipo de avatar</h2>
          <div className="grid grid-cols-3 gap-2">
            {AVATAR_TYPES.map((t) => (
              <button
                key={`${t.value}-${t.subtype}`}
                onClick={() => { setAvatarType(t.value); setAvatarSubtype(t.subtype); }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                  avatarType === t.value && avatarSubtype === t.subtype
                    ? "border-accent bg-accent/10 text-[#F0EDE8]"
                    : "border-[#222] text-[#6b6b6b] hover:border-[#333]"
                }`}
              >
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 space-y-4">
          <h2 className="font-syne font-bold text-base text-[#F0EDE8]">Identidad visual</h2>

          <div>
            <label className="block text-xs text-[#6b6b6b] mb-2">Color primario</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-[#222] cursor-pointer bg-transparent"
              />
              <input
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className={`${inputClass} flex-1`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#6b6b6b] mb-2">Color secundario</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={brandColor2}
                onChange={(e) => setBrandColor2(e.target.value)}
                className="w-10 h-10 rounded-lg border border-[#222] cursor-pointer bg-transparent"
              />
              <input
                value={brandColor2}
                onChange={(e) => setBrandColor2(e.target.value)}
                className={`${inputClass} flex-1`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#6b6b6b] mb-2">URL del logo (opcional)</label>
            <input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://tuempresa.com/logo.png"
              className={inputClass}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-accent text-white font-medium py-3 rounded-xl hover:bg-accent/90 disabled:opacity-50 transition-all"
        >
          {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar avatar"}
        </button>
      </div>

      {/* Right — Live Preview */}
      <div className="flex flex-col items-center gap-6">
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-8 flex flex-col items-center gap-4 w-full">
          <h2 className="font-syne font-bold text-base text-[#F0EDE8] self-start">Preview</h2>

          <div className="relative">
            <div
              className="w-40 h-40 rounded-full flex items-center justify-center overflow-hidden"
              style={{ background: `${brandColor}15`, border: `2px solid ${brandColor}30` }}
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
              className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-[#111] bg-green-500"
            />
          </div>

          <button
            onClick={() => setIsTalking(!isTalking)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              isTalking
                ? "bg-accent/10 border-accent/30 text-accent"
                : "bg-[#1a1a1a] border-[#222] text-[#6b6b6b] hover:border-[#333]"
            }`}
          >
            {isTalking ? "⏸ Detener animación" : "▶ Simular hablando"}
          </button>

          <p className="text-xs text-[#6b6b6b] text-center">
            El avatar parpadea, respira y sincroniza los labios cuando habla.
          </p>
        </div>

        {/* Mini chat preview */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5 w-full space-y-3">
          <p className="text-xs text-[#6b6b6b] font-medium uppercase tracking-wider">Cómo se ve en el widget</p>
          <div className="flex items-center gap-3 pb-3 border-b border-[#1a1a1a]">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
              style={{ background: `${brandColor}15`, border: `1px solid ${brandColor}30` }}
            >
              <AvatarCanvas
                config={{ type: avatarType, subtype: avatarSubtype, brandColor, brandColor2, size: 40 }}
                size={40}
              />
            </div>
            <div>
              <p className="text-sm font-syne font-bold text-[#F0EDE8]">Agente</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-[#6b6b6b]">En línea</span>
              </div>
            </div>
          </div>
          <div className="max-w-[85%] bg-[#1a1a1a] rounded-2xl rounded-tl-sm px-3 py-2">
            <p className="text-xs text-[#F0EDE8]">¡Hola! ¿En qué te puedo ayudar?</p>
          </div>
          <div className="max-w-[85%] ml-auto rounded-2xl rounded-tr-sm px-3 py-2" style={{ background: brandColor }}>
            <p className="text-xs text-white">¿Cuánto cuesta?</p>
          </div>
        </div>
      </div>
    </div>
  );
}
