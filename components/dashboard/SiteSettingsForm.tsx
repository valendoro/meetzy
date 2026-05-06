"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SiteData {
  siteId: string;
  agentName: string;
  agentRole: string;
  agentPersonality: string;
  welcomeMessage: string;
  systemPrompt: string;
  language: string;
  brandColor: string;
  brandColor2: string;
  webhookUrl: string | null;
  calBookingUrl: string | null;
  voiceEnabled: boolean;
  voiceId: string | null;
}

export default function SiteSettingsForm({ site }: { site: SiteData }) {
  const router = useRouter();
  const [form, setForm] = useState({
    agentName: site.agentName,
    agentRole: site.agentRole,
    agentPersonality: site.agentPersonality,
    welcomeMessage: site.welcomeMessage,
    systemPrompt: site.systemPrompt,
    language: site.language,
    brandColor: site.brandColor,
    brandColor2: site.brandColor2,
    webhookUrl: site.webhookUrl ?? "",
    calBookingUrl: site.calBookingUrl ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/sites/${site.siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Error al guardar");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    } catch {
      setError("Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full bg-[#0e0e0e] border border-[#222] text-[#F0EDE8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-[#444]";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 space-y-4">
        <h2 className="font-syne font-bold text-base text-[#F0EDE8]">Identidad del agente</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#6b6b6b] mb-2">Nombre del agente</label>
            <input name="agentName" value={form.agentName} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-[#6b6b6b] mb-2">Rol</label>
            <input name="agentRole" value={form.agentRole} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#6b6b6b] mb-2">Personalidad</label>
          <input name="agentPersonality" value={form.agentPersonality} onChange={handleChange} className={inputClass} placeholder="amigable y profesional" />
        </div>

        <div>
          <label className="block text-xs text-[#6b6b6b] mb-2">Mensaje de bienvenida</label>
          <input name="welcomeMessage" value={form.welcomeMessage} onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <label className="block text-xs text-[#6b6b6b] mb-2">Idioma</label>
          <select name="language" value={form.language} onChange={handleChange} className={inputClass}>
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="pt">Português</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>

      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 space-y-4">
        <h2 className="font-syne font-bold text-base text-[#F0EDE8]">System Prompt</h2>
        <p className="text-xs text-[#6b6b6b]">Instrucciones base del agente. Editá para personalizar su conocimiento.</p>
        <textarea
          name="systemPrompt"
          value={form.systemPrompt}
          onChange={handleChange}
          rows={10}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 space-y-4">
        <h2 className="font-syne font-bold text-base text-[#F0EDE8]">Marca</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#6b6b6b] mb-2">Color primario</label>
            <div className="flex items-center gap-2">
              <input type="color" name="brandColor" value={form.brandColor} onChange={handleChange} className="w-10 h-10 rounded-lg border border-[#222] cursor-pointer bg-transparent" />
              <input name="brandColor" value={form.brandColor} onChange={handleChange} className={`${inputClass} flex-1`} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#6b6b6b] mb-2">Color secundario</label>
            <div className="flex items-center gap-2">
              <input type="color" name="brandColor2" value={form.brandColor2} onChange={handleChange} className="w-10 h-10 rounded-lg border border-[#222] cursor-pointer bg-transparent" />
              <input name="brandColor2" value={form.brandColor2} onChange={handleChange} className={`${inputClass} flex-1`} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 space-y-4">
        <h2 className="font-syne font-bold text-base text-[#F0EDE8]">Integraciones</h2>
        <div>
          <label className="block text-xs text-[#6b6b6b] mb-2">Cal.com URL (booking)</label>
          <input name="calBookingUrl" value={form.calBookingUrl} onChange={handleChange} className={inputClass} placeholder="https://cal.com/tu-nombre" />
        </div>
        <div>
          <label className="block text-xs text-[#6b6b6b] mb-2">Webhook URL (CRM)</label>
          <input name="webhookUrl" value={form.webhookUrl} onChange={handleChange} className={inputClass} placeholder="https://hook.us1.make.com/..." />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-accent text-white font-medium px-6 py-3 rounded-xl hover:bg-accent/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
