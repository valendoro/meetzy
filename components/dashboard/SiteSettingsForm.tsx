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
  agentType?: string;
  proactiveEnabled?: boolean;
  proactiveFrequency?: string;
  exitIntentEnabled?: boolean;
  widgetPosition?: string;
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
    agentType: site.agentType ?? "guia",
    proactiveEnabled: site.proactiveEnabled ?? true,
    proactiveFrequency: site.proactiveFrequency ?? "normal",
    exitIntentEnabled: site.exitIntentEnabled ?? true,
    widgetPosition: site.widgetPosition ?? "bottom-right",
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

      {/* Widget behavior */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 space-y-5">
        <h2 className="font-syne font-bold text-base text-[#F0EDE8]">Comportamiento del widget</h2>

        <div>
          <label className="block text-xs text-[#6b6b6b] mb-2">Tipo de agente</label>
          <select name="agentType" value={form.agentType}
            onChange={e => setForm(p => ({ ...p, agentType: e.target.value }))}
            className={inputClass}>
            <option value="guia">🧭 Guía — Acompaña al visitante</option>
            <option value="vendedor">💰 Vendedor — Detecta interés y cierra</option>
            <option value="soporte">🔧 Soporte — Resuelve dudas técnicas</option>
            <option value="recepcionista">📋 Recepcionista — Agenda y deriva</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#F0EDE8]">Mensajes proactivos</p>
            <p className="text-xs text-[#6b6b6b] mt-0.5">El agente inicia conversación según el comportamiento</p>
          </div>
          <button
            type="button"
            onClick={() => setForm(p => ({ ...p, proactiveEnabled: !p.proactiveEnabled }))}
            className={`relative w-10 h-5 rounded-full transition-colors ${form.proactiveEnabled ? "bg-accent" : "bg-[#333]"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.proactiveEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        {form.proactiveEnabled && (
          <div>
            <label className="block text-xs text-[#6b6b6b] mb-2">Frecuencia de mensajes</label>
            <select name="proactiveFrequency" value={form.proactiveFrequency}
              onChange={e => setForm(p => ({ ...p, proactiveFrequency: e.target.value }))}
              className={inputClass}>
              <option value="conservador">Conservador — cada 10 minutos</option>
              <option value="normal">Normal — cada 3 minutos</option>
              <option value="proactivo">Proactivo — cada 1 minuto</option>
            </select>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#F0EDE8]">Exit intent</p>
            <p className="text-xs text-[#6b6b6b] mt-0.5">Mensaje cuando el visitante está por irse</p>
          </div>
          <button
            type="button"
            onClick={() => setForm(p => ({ ...p, exitIntentEnabled: !p.exitIntentEnabled }))}
            className={`relative w-10 h-5 rounded-full transition-colors ${form.exitIntentEnabled ? "bg-accent" : "bg-[#333]"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.exitIntentEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        <div>
          <label className="block text-xs text-[#6b6b6b] mb-2">Posición del widget</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "bottom-right", label: "↘ Abajo derecha" },
              { value: "bottom-left", label: "↙ Abajo izquierda" },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm(p => ({ ...p, widgetPosition: opt.value }))}
                className={`text-sm py-2.5 rounded-xl border transition-all ${form.widgetPosition === opt.value ? "border-accent bg-accent/10 text-[#F0EDE8]" : "border-[#222] text-[#6b6b6b] hover:border-[#333]"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
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
