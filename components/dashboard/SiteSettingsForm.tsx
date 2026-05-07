"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DeleteSiteButton from "@/components/dashboard/DeleteSiteButton";
import { useProductToast } from "@/components/providers/product-toast";

interface SiteData {
  siteId: string;
  name: string;
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
  const { push } = useProductToast();
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
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
        const msg = data.error ?? "Error al guardar";
        setError(msg);
        push(msg, "error");
      } else {
        setSaved(true);
        push("Cambios guardados", "success");
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    } catch {
      setError("Error inesperado");
      push("Error inesperado al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="w-full">
      <div className="dash-panel p-6 sm:p-9 md:p-10 w-full">
        {/* Identidad */}
        <div>
          <h2 className="dash-section-title mb-6">Identidad del agente</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="dash-label">Nombre del agente</label>
              <input name="agentName" value={form.agentName} onChange={handleChange} className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Rol</label>
              <input name="agentRole" value={form.agentRole} onChange={handleChange} className="dash-input" />
            </div>
          </div>
          <div className="mt-5">
            <label className="dash-label">Personalidad</label>
            <input
              name="agentPersonality"
              value={form.agentPersonality}
              onChange={handleChange}
              className="dash-input"
              placeholder="amigable y profesional"
            />
          </div>
          <div className="mt-5">
            <label className="dash-label">Mensaje de bienvenida</label>
            <input name="welcomeMessage" value={form.welcomeMessage} onChange={handleChange} className="dash-input" />
          </div>
          <div className="mt-5 max-w-md">
            <label className="dash-label">Idioma</label>
            <select name="language" value={form.language} onChange={handleChange} className="dash-input">
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>

        <div className="dash-divider my-8" />

        {/* System prompt */}
        <div>
          <h2 className="dash-section-title mb-1">System prompt</h2>
          <p className="text-sm leading-relaxed text-[color:var(--c-muted)] mb-5 max-w-3xl">
            Instrucciones base del agente. Editá para personalizar tono y conocimiento.
          </p>
          <textarea
            name="systemPrompt"
            value={form.systemPrompt}
            onChange={handleChange}
            rows={12}
            className="dash-input resize-y min-h-[220px] font-[var(--font-dm-sans,_sans-serif)] leading-relaxed"
          />
        </div>

        <div className="dash-divider my-8" />

        {/* Marca */}
        <div>
          <h2 className="dash-section-title mb-6">Marca</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="dash-label">Color primario</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="brandColor"
                  value={form.brandColor}
                  onChange={handleChange}
                  className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border border-[color:var(--c-border)] bg-transparent"
                />
                <input name="brandColor" value={form.brandColor} onChange={handleChange} className="dash-input flex-1 font-mono text-sm" />
              </div>
            </div>
            <div>
              <label className="dash-label">Color secundario</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="brandColor2"
                  value={form.brandColor2}
                  onChange={handleChange}
                  className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border border-[color:var(--c-border)] bg-transparent"
                />
                <input name="brandColor2" value={form.brandColor2} onChange={handleChange} className="dash-input flex-1 font-mono text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="dash-divider my-8" />

        {/* Integraciones */}
        <div>
          <h2 className="dash-section-title mb-6">Integraciones</h2>
          <div className="space-y-5 max-w-3xl">
            <div>
              <label className="dash-label">Cal.com URL (booking)</label>
              <input name="calBookingUrl" value={form.calBookingUrl} onChange={handleChange} className="dash-input" placeholder="https://cal.com/tu-nombre" />
            </div>
            <div>
              <label className="dash-label">Webhook URL (CRM)</label>
              <input name="webhookUrl" value={form.webhookUrl} onChange={handleChange} className="dash-input" placeholder="https://hook.us1.make.com/..." />
            </div>
          </div>
        </div>

        <div className="dash-divider my-8" />

        {/* Widget */}
        <div className="space-y-6">
          <h2 className="dash-section-title">Comportamiento del widget</h2>

          <div className="max-w-xl">
            <label className="dash-label">Tipo de agente</label>
            <select
              name="agentType"
              value={form.agentType}
              onChange={(e) => setForm((p) => ({ ...p, agentType: e.target.value }))}
              className="dash-input"
            >
              <option value="guia">🧭 Guía — Acompaña al visitante</option>
              <option value="vendedor">💰 Vendedor — Detecta interés y cierra</option>
              <option value="soporte">🔧 Soporte — Resuelve dudas técnicas</option>
              <option value="recepcionista">📋 Recepcionista — Agenda y deriva</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[color:var(--c-border)] bg-[color:var(--c-surface3)] px-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-[color:var(--c-text)]">Mensajes proactivos</p>
              <p className="text-xs mt-0.5 text-[color:var(--c-muted)]">El agente inicia conversación según el comportamiento</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, proactiveEnabled: !p.proactiveEnabled }))}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                form.proactiveEnabled ? "bg-[color:var(--c-accent)]" : "bg-[color:var(--c-surface2)]"
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  form.proactiveEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {form.proactiveEnabled && (
            <div className="max-w-xl">
              <label className="dash-label">Frecuencia de mensajes</label>
              <select
                name="proactiveFrequency"
                value={form.proactiveFrequency}
                onChange={(e) => setForm((p) => ({ ...p, proactiveFrequency: e.target.value }))}
                className="dash-input"
              >
                <option value="conservador">Conservador — cada 10 minutos</option>
                <option value="normal">Normal — cada 3 minutos</option>
                <option value="proactivo">Proactivo — cada 1 minuto</option>
              </select>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[color:var(--c-border)] bg-[color:var(--c-surface3)] px-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-[color:var(--c-text)]">Exit intent</p>
              <p className="text-xs mt-0.5 text-[color:var(--c-muted)]">Mensaje cuando el visitante está por irse</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, exitIntentEnabled: !p.exitIntentEnabled }))}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                form.exitIntentEnabled ? "bg-[color:var(--c-accent)]" : "bg-[color:var(--c-surface2)]"
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  form.exitIntentEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="dash-label">Posición del widget</label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {[
                { value: "bottom-right", label: "↘ Abajo derecha" },
                { value: "bottom-left", label: "↙ Abajo izquierda" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, widgetPosition: opt.value }))}
                  className={`cursor-pointer rounded-[var(--radius-md)] border py-3 text-sm transition-all ${
                    form.widgetPosition === opt.value
                      ? "border-[color:var(--c-accent)] bg-[color:var(--c-accent-dim)] text-[color:var(--c-text)]"
                      : "border-[color:var(--c-border)] text-[color:var(--c-muted)] hover:border-[color:var(--c-border2)] hover:text-[color:var(--c-text)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error ? <p className="mt-8 text-sm text-red-400">{error}</p> : null}

        <div className="dash-divider mt-10 mb-8" />

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50 disabled:hover:translate-y-0">
            {saving ? "Guardando…" : saved ? "¡Guardado!" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </form>

    <div
      className="dash-panel mt-6 p-6 md:p-8"
      style={{ borderColor: "rgba(239, 68, 68, 0.22)", boxShadow: "0 0 0 1px rgba(239, 68, 68, 0.06) inset" }}
    >
      <h2 className="font-syne font-bold text-base text-red-400 mb-1">Zona peligrosa</h2>
      <p className="text-sm text-[color:var(--c-muted)] mb-4 max-w-xl leading-relaxed">
        Al eliminar el sitio, el widget deja de responder, se borran todas las conversaciones y esta acción no se puede
        deshacer.
      </p>
      <DeleteSiteButton
        siteId={site.siteId}
        siteName={site.name}
        variant="page"
        className="rounded-[var(--radius-md)] px-4 py-2.5 border border-red-500/35 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
      />
    </div>
    </>
  );
}
