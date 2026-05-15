"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DeleteSiteButton from "@/components/dashboard/DeleteSiteButton";
import { useProductToast } from "@/components/providers/product-toast";
import { User, Palette, Webhook, Settings2, Save, Zap, CheckCircle2, XCircle, Loader2 } from "lucide-react";

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

function Section({ icon, title, description, children }: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-[var(--text-secondary)]">
          {icon}
        </div>
        <div>
          <h2 className="font-syne text-[14px] font-bold text-[var(--text-primary)]">{title}</h2>
          {description && <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)] leading-relaxed">{description}</p>}
        </div>
      </div>
      <div className="pl-11">
        {children}
      </div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="dash-label">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">{hint}</p>}
    </div>
  );
}

function ToggleRow({ label, description, active, onChange }: {
  label: string;
  description: string;
  active: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-4 py-3.5">
      <div>
        <p className="text-[13px] font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-[11px] mt-0.5 text-[var(--text-tertiary)]">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        data-active={active ? "true" : "false"}
        className="dash-toggle dash-toggle--lg shrink-0"
      >
        <span className="dash-toggle__knob" />
      </button>
    </div>
  );
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
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookResult, setWebhookResult] = useState<{ success: boolean; status?: number; error?: string } | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleWebhookTest() {
    if (!form.webhookUrl.trim()) { push("Primero ingresá una URL de webhook", "error"); return; }
    setWebhookTesting(true);
    setWebhookResult(null);
    try {
      const res = await fetch(`/api/sites/${site.siteId}/webhooks/test`, { method: "POST" });
      const j = (await res.json()) as { success: boolean; status?: number; error?: string };
      setWebhookResult(j);
      if (j.success) push(`Webhook OK — HTTP ${j.status ?? ""}`, "success");
      else push(j.error ?? `Webhook falló — HTTP ${j.status ?? ""}`, "error");
    } catch {
      setWebhookResult({ success: false, error: "Error de red" });
      push("Error de red al probar el webhook", "error");
    } finally {
      setWebhookTesting(false);
    }
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
        setTimeout(() => setSaved(false), 2500);
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
      <form onSubmit={handleSubmit} className="w-full space-y-0">
        {/* ── Identidad ─────────────────────────────────── */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 sm:p-8 space-y-8">
          <Section
            icon={<User className="size-4" />}
            title="Identidad del agente"
            description="Cómo se presenta tu agente a los visitantes."
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Nombre del agente">
                <input name="agentName" value={form.agentName} onChange={handleChange} className="dash-input" placeholder="Ej: Mia" />
              </Field>
              <Field label="Rol">
                <input name="agentRole" value={form.agentRole} onChange={handleChange} className="dash-input" placeholder="Ej: Asistente de ventas" />
              </Field>
            </div>
            <Field label="Personalidad" hint="Describe el tono: formal, amigable, técnico, etc.">
              <input
                name="agentPersonality"
                value={form.agentPersonality}
                onChange={handleChange}
                className="dash-input"
                placeholder="amigable y profesional"
              />
            </Field>
            <Field label="Mensaje de bienvenida" hint="Primera frase que ve el visitante al abrir el chat.">
              <input name="welcomeMessage" value={form.welcomeMessage} onChange={handleChange} className="dash-input" />
            </Field>
            <Field label="Idioma" hint="Idioma en el que responde el agente.">
              <select name="language" value={form.language} onChange={handleChange} className="dash-input max-w-xs">
                <option value="es">🇦🇷 Español</option>
                <option value="en">🇺🇸 English</option>
                <option value="pt">🇧🇷 Português</option>
                <option value="fr">🇫🇷 Français</option>
              </select>
            </Field>
          </Section>

          <div className="dash-divider" />

          {/* ── System prompt ─────────────────────────────── */}
          <Section
            icon={<Settings2 className="size-4" />}
            title="System prompt"
            description="Instrucciones base del agente. Podés personalizar su tono, restricciones y conocimiento específico."
          >
            <textarea
              name="systemPrompt"
              value={form.systemPrompt}
              onChange={handleChange}
              rows={12}
              className="dash-input resize-y min-h-[200px] font-[var(--font-dm-sans,_sans-serif)] leading-relaxed text-[13px]"
            />
          </Section>

          <div className="dash-divider" />

          {/* ── Marca ─────────────────────────────────────── */}
          <Section
            icon={<Palette className="size-4" />}
            title="Colores de marca"
            description="El widget se adapta a tu paleta de colores."
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Color primario">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="brandColor"
                    value={form.brandColor}
                    onChange={handleChange}
                    className="h-10 w-10 shrink-0 cursor-pointer rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-transparent p-1"
                  />
                  <input name="brandColor" value={form.brandColor} onChange={handleChange} className="dash-input flex-1 font-mono text-[13px]" />
                </div>
              </Field>
              <Field label="Color secundario">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="brandColor2"
                    value={form.brandColor2}
                    onChange={handleChange}
                    className="h-10 w-10 shrink-0 cursor-pointer rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-transparent p-1"
                  />
                  <input name="brandColor2" value={form.brandColor2} onChange={handleChange} className="dash-input flex-1 font-mono text-[13px]" />
                </div>
              </Field>
            </div>
          </Section>

          <div className="dash-divider" />

          {/* ── Integraciones ─────────────────────────────── */}
          <Section
            icon={<Webhook className="size-4" />}
            title="Integraciones"
            description="Conectá el agente con tu stack. El webhook dispara solo en hot leads."
          >
            <div className="grid gap-5 max-w-2xl">
              <Field label="Cal.com URL (reserva de turnos)" hint="Cuando el visitante quiera agendar, el agente va a ofrecer este link.">
                <input name="calBookingUrl" value={form.calBookingUrl} onChange={handleChange} className="dash-input" placeholder="https://cal.com/tu-nombre" />
              </Field>
              <Field
                label="Webhook URL (CRM / n8n / Make)"
                hint="Dispara en: primer hot lead, primer email capturado. Payload JSON con visitorEmail, intentLabel, conversationId y más."
              >
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      name="webhookUrl"
                      value={form.webhookUrl}
                      onChange={(e) => { handleChange(e); setWebhookResult(null); }}
                      className="dash-input flex-1"
                      placeholder="https://hook.us1.make.com/..."
                    />
                    <button
                      type="button"
                      onClick={() => void handleWebhookTest()}
                      disabled={webhookTesting || !form.webhookUrl.trim()}
                      className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-overlay)] px-3 py-2 text-[12px] font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--accent-border)] hover:text-[var(--accent)] disabled:opacity-40"
                    >
                      {webhookTesting
                        ? <Loader2 className="size-3.5 animate-spin" />
                        : <Zap className="size-3.5" />}
                      Probar
                    </button>
                  </div>
                  {webhookResult && (
                    <div className={`flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-[12px] ${
                      webhookResult.success
                        ? "border-emerald-500/30 bg-emerald-500/08 text-emerald-400"
                        : "border-[#f87171]/30 bg-[#f87171]/08 text-[#f87171]"
                    }`}>
                      {webhookResult.success
                        ? <CheckCircle2 className="size-3.5 shrink-0" />
                        : <XCircle className="size-3.5 shrink-0" />}
                      {webhookResult.success
                        ? `HTTP ${webhookResult.status} — Webhook recibido correctamente ✓`
                        : (webhookResult.error ?? `HTTP ${webhookResult.status} — El servidor rechazó la solicitud`)}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {["hot_lead", "ready_to_buy", "email_captured", "test"].map((ev) => (
                      <span key={ev} className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-tertiary)]">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
              </Field>
            </div>
          </Section>

          <div className="dash-divider" />

          {/* ── Widget ────────────────────────────────────── */}
          <Section
            icon={<Settings2 className="size-4" />}
            title="Comportamiento del widget"
            description="Controlá cómo y cuándo el agente interactúa con los visitantes."
          >
            <div className="space-y-5">
              <Field label="Tipo de agente" hint="Define el rol del agente y los chips de sugerencia que verán los visitantes.">
                <select
                  name="agentType"
                  value={form.agentType}
                  onChange={(e) => set("agentType", e.target.value)}
                  className="dash-input max-w-sm"
                >
                  <option value="guia">🧭 Guía — Acompaña al visitante</option>
                  <option value="vendedor">💰 Vendedor — Detecta interés y cierra</option>
                  <option value="soporte">🔧 Soporte — Resuelve dudas técnicas</option>
                  <option value="recepcionista">📋 Recepcionista — Agenda y deriva</option>
                </select>
              </Field>

              <ToggleRow
                label="Mensajes proactivos"
                description="El agente inicia la conversación según el comportamiento del visitante"
                active={form.proactiveEnabled}
                onChange={() => set("proactiveEnabled", !form.proactiveEnabled)}
              />

              {form.proactiveEnabled && (
                <Field label="Frecuencia de mensajes proactivos" hint="Cuánto tiempo espera el agente antes de enviar un nuevo mensaje.">
                  <select
                    name="proactiveFrequency"
                    value={form.proactiveFrequency}
                    onChange={(e) => set("proactiveFrequency", e.target.value)}
                    className="dash-input max-w-xs"
                  >
                    <option value="conservador">Conservador — cada 10 min</option>
                    <option value="normal">Normal — cada 3 min</option>
                    <option value="proactivo">Proactivo — cada 1 min</option>
                  </select>
                </Field>
              )}

              <ToggleRow
                label="Exit intent"
                description="Mensaje de retención cuando el visitante está por abandonar la página"
                active={form.exitIntentEnabled}
                onChange={() => set("exitIntentEnabled", !form.exitIntentEnabled)}
              />

              <Field label="Posición del widget">
                <div className="flex gap-3 max-w-xs">
                  {[
                    { value: "bottom-right", label: "↘ Derecha" },
                    { value: "bottom-left", label: "↙ Izquierda" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set("widgetPosition", opt.value)}
                      className={`flex-1 cursor-pointer rounded-[var(--radius-md)] border py-2.5 text-[13px] transition-all ${
                        form.widgetPosition === opt.value
                          ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--text-primary)] font-medium"
                          : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </Section>
        </div>

        {/* Save bar */}
        <div className="sticky bottom-0 z-20 mt-0 rounded-b-[var(--radius-xl)] border-t border-[var(--border-subtle)] bg-[rgba(11,10,15,0.88)] px-6 py-4 backdrop-blur-lg sm:px-8">
          {error && <p className="mb-3 text-[12px] text-red-400">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <Save className="size-3.5" />
              {saving ? "Guardando…" : saved ? "¡Guardado! ✓" : "Guardar cambios"}
            </button>
            <span className="text-[12px] text-[var(--text-tertiary)]">
              Los cambios se aplican de inmediato en el widget.
            </span>
          </div>
        </div>
      </form>

      {/* Danger zone */}
      <div
        className="mt-6 rounded-[var(--radius-xl)] border p-6 sm:p-8"
        style={{ borderColor: "rgba(239, 68, 68, 0.22)", background: "rgba(239, 68, 68, 0.03)" }}
      >
        <h2 className="font-syne font-bold text-[14px] text-red-400 mb-1">Zona peligrosa</h2>
        <p className="text-[13px] text-[var(--text-secondary)] mb-5 max-w-xl leading-relaxed">
          Al eliminar el sitio, el widget deja de responder y se borran todas las conversaciones. Esta acción no se puede deshacer.
        </p>
        <DeleteSiteButton
          siteId={site.siteId}
          siteName={site.name}
          variant="page"
          className="rounded-[var(--radius-md)] px-4 py-2.5 border border-red-500/35 text-[13px] text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
        />
      </div>
    </>
  );
}
