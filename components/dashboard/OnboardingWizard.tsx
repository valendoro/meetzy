"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OnboardingWizardProps {
  userPlan: string;
}

interface ScrapeResult {
  systemPrompt: string;
  siteName: string;
  preview: string;
  detectedLanguage: string;
}

interface FormData {
  url: string;
  siteName: string;
  systemPrompt: string;
  detectedLanguage: string;
  preview: string;
  agentName: string;
  agentRole: string;
  agentPersonality: string;
  welcomeMessage: string;
  avatarType: string;
  avatarSubtype: string;
  brandColor: string;
  brandColor2: string;
  logoUrl: string;
  embedMode: "widget" | "fullpage";
  primaryQuestion: string;
}

const AVATAR_TYPES = [
  { id: "human_male", type: "human", label: "Humano ♂", emoji: "👨" },
  { id: "human_female", type: "human", label: "Humano ♀", emoji: "👩" },
  { id: "animal", type: "animal", label: "Animal", emoji: "🐶" },
  { id: "object", type: "object", label: "Objeto/Mascota", emoji: "⭐" },
];

const ANIMAL_SUBTYPES = ["perro", "gato", "conejo", "pájaro", "zorro"];
const OBJECT_SUBTYPES = ["taza", "naranja", "manzana", "caja", "estrella"];

const STEPS = ["URL", "Agente", "Avatar", "Instalar"];

export default function OnboardingWizard({ userPlan }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdSiteId, setCreatedSiteId] = useState("");

  const [form, setForm] = useState<FormData>({
    url: "",
    siteName: "",
    systemPrompt: "",
    detectedLanguage: "es",
    preview: "",
    agentName: "Asistente",
    agentRole: "asistente virtual",
    agentPersonality: "amigable y profesional",
    welcomeMessage: "¡Hola! ¿En qué te puedo ayudar hoy?",
    avatarType: "",
    avatarSubtype: "",
    brandColor: "#6366f1",
    brandColor2: "#8b5cf6",
    logoUrl: "",
    embedMode: "widget",
    primaryQuestion: "",
  });

  const isPro = userPlan === "pro" || userPlan === "elite";

  function setField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleScrape() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.url }),
      });
      const data = (await res.json()) as ScrapeResult & { error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "Error al analizar el sitio");
        return;
      }
      setForm((prev) => ({
        ...prev,
        siteName: data.siteName,
        systemPrompt: data.systemPrompt,
        detectedLanguage: data.detectedLanguage,
        preview: data.preview,
        agentName: prev.agentName,
      }));
      setStep(1);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.siteName || form.url,
          url: form.url,
          agentName: form.agentName,
          agentRole: form.agentRole,
          agentPersonality: form.agentPersonality,
          welcomeMessage: form.welcomeMessage,
          systemPrompt: form.systemPrompt,
          language: form.detectedLanguage,
          brandColor: form.brandColor,
          brandColor2: form.brandColor2,
          avatarType: form.avatarType || undefined,
          avatarSubtype: form.avatarSubtype || undefined,
          logoUrl: form.logoUrl || undefined,
          embedMode: form.embedMode,
          primaryQuestion: form.primaryQuestion || undefined,
        }),
      });
      const data = (await res.json()) as { site?: { siteId: string }; error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "Error al crear el agente");
        return;
      }
      setCreatedSiteId(data.site!.siteId);
      setStep(3);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-[#0e0e0e] border border-[#222] text-[#F0EDE8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-[#444]";

  return (
    <div className="max-w-2xl">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-syne font-bold flex-shrink-0 transition-all ${
                i < step
                  ? "bg-accent text-white"
                  : i === step
                  ? "bg-accent/20 border-2 border-accent text-accent"
                  : "bg-[#111] border border-[#222] text-[#444]"
              }`}
            >
              {i < step ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-sm hidden md:block ${
                i === step ? "text-[#F0EDE8] font-medium" : "text-[#444]"
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px ${i < step ? "bg-accent" : "bg-[#1e1e1e]"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0 — URL */}
      {step === 0 && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-8 space-y-6">
          <div>
            <h2 className="font-syne font-bold text-xl text-[#F0EDE8] mb-1">
              ¿Cuál es la URL de tu sitio?
            </h2>
            <p className="text-sm text-[#6b6b6b]">
              Lo analizamos automáticamente y armamos el sistema del agente.
            </p>
          </div>

          {/* Mode selector */}
          <div>
            <label className="block text-xs text-[#6b6b6b] mb-3">Modo del agente</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: "widget",
                  label: "Widget flotante",
                  desc: "Burbuja en la esquina de tu web existente",
                  icon: "💬",
                },
                {
                  value: "fullpage",
                  label: "Full-page",
                  desc: "La conversación reemplaza tu landing page",
                  icon: "⚡",
                  badge: "Nuevo",
                },
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setField("embedMode", mode.value as "widget" | "fullpage")}
                  className={`relative text-left p-4 rounded-xl border transition-all ${
                    form.embedMode === mode.value
                      ? "border-accent bg-accent/10"
                      : "border-[#222] bg-[#0e0e0e] hover:border-[#333]"
                  }`}
                >
                  {mode.badge && (
                    <span className="absolute top-2 right-2 text-[9px] bg-accent text-white px-1.5 py-0.5 rounded-full font-semibold">
                      {mode.badge}
                    </span>
                  )}
                  <span className="text-xl mb-2 block">{mode.icon}</span>
                  <p className={`text-sm font-semibold font-syne mb-1 ${form.embedMode === mode.value ? "text-[#F0EDE8]" : "text-[#6b6b6b]"}`}>
                    {mode.label}
                  </p>
                  <p className="text-xs text-[#444] leading-tight">{mode.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#6b6b6b] mb-2">URL del sitio</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setField("url", e.target.value)}
              placeholder="https://miempresa.com"
              className={inputClass}
              onKeyDown={(e) => e.key === "Enter" && !loading && form.url && handleScrape()}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleScrape}
            disabled={!form.url || loading}
            className="w-full bg-accent text-white font-medium py-3 rounded-xl hover:bg-accent/90 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Leyendo tu sitio...
              </>
            ) : (
              "Analizar sitio →"
            )}
          </button>
        </div>
      )}

      {/* Step 1 — Agent config */}
      {step === 1 && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-8 space-y-5">
          <div>
            <h2 className="font-syne font-bold text-xl text-[#F0EDE8] mb-1">
              Configurá tu agente
            </h2>
            {form.preview && (
              <p className="text-sm text-[#6b6b6b] bg-[#0e0e0e] rounded-xl p-3 border border-[#1e1e1e]">
                {form.preview}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6b6b6b] mb-2">Nombre del agente</label>
              <input value={form.agentName} onChange={(e) => setField("agentName", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-[#6b6b6b] mb-2">Nombre del sitio</label>
              <input value={form.siteName} onChange={(e) => setField("siteName", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#6b6b6b] mb-2">Rol</label>
            <select value={form.agentRole} onChange={(e) => setField("agentRole", e.target.value)} className={inputClass}>
              <option value="asistente virtual">Asistente virtual</option>
              <option value="vendedor">Vendedor</option>
              <option value="soporte técnico">Soporte técnico</option>
              <option value="guía de bienvenida">Guía de bienvenida</option>
              <option value="asesor">Asesor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#6b6b6b] mb-2">Personalidad</label>
            <select value={form.agentPersonality} onChange={(e) => setField("agentPersonality", e.target.value)} className={inputClass}>
              <option value="amigable y profesional">Amigable y profesional</option>
              <option value="formal y serio">Formal y serio</option>
              <option value="divertido y casual">Divertido y casual</option>
              <option value="empático y cercano">Empático y cercano</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#6b6b6b] mb-2">Mensaje de bienvenida</label>
            <input value={form.welcomeMessage} onChange={(e) => setField("welcomeMessage", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs text-[#6b6b6b] mb-2">System Prompt</label>
            <p className="text-xs text-[#444] mb-2">Generado automáticamente. Editá si querés personalizar.</p>
            <textarea
              value={form.systemPrompt}
              onChange={(e) => setField("systemPrompt", e.target.value)}
              rows={8}
              className={`${inputClass} resize-none`}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="flex-1 border border-[#333] text-[#6b6b6b] font-medium py-3 rounded-xl hover:border-[#555] transition-colors">
              ← Atrás
            </button>
            <button
              onClick={() => isPro ? setStep(2) : handleCreate()}
              disabled={!form.systemPrompt || loading}
              className="flex-1 bg-accent text-white font-medium py-3 rounded-xl hover:bg-accent/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creando...</>
              ) : (
                isPro ? "Elegir avatar →" : "Crear agente →"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Avatar (Pro+) */}
      {step === 2 && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-8 space-y-6">
          <div>
            <h2 className="font-syne font-bold text-xl text-[#F0EDE8] mb-1">
              Elegí el avatar
            </h2>
            <p className="text-sm text-[#6b6b6b]">
              El avatar llevará los colores y logo de tu marca.
            </p>
          </div>

          <div>
            <label className="block text-xs text-[#6b6b6b] mb-3">Tipo de personaje</label>
            <div className="grid grid-cols-2 gap-3">
              {AVATAR_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setField("avatarType", t.type);
                    setField("avatarSubtype", t.id === "human_male" ? "male" : t.id === "human_female" ? "female" : "");
                  }}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    form.avatarType === t.type &&
                    (t.type !== "human" || form.avatarSubtype === (t.id === "human_male" ? "male" : "female"))
                      ? "border-accent bg-accent/10 text-[#F0EDE8]"
                      : "border-[#222] text-[#6b6b6b] hover:border-[#333]"
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {form.avatarType === "animal" && (
            <div>
              <label className="block text-xs text-[#6b6b6b] mb-3">¿Qué animal?</label>
              <div className="flex flex-wrap gap-2">
                {ANIMAL_SUBTYPES.map((a) => (
                  <button
                    key={a}
                    onClick={() => setField("avatarSubtype", a)}
                    className={`px-4 py-2 rounded-xl text-sm border capitalize transition-all ${
                      form.avatarSubtype === a
                        ? "border-accent bg-accent/10 text-[#F0EDE8]"
                        : "border-[#222] text-[#6b6b6b] hover:border-[#333]"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {form.avatarType === "object" && (
            <div>
              <label className="block text-xs text-[#6b6b6b] mb-3">¿Qué objeto?</label>
              <div className="flex flex-wrap gap-2">
                {OBJECT_SUBTYPES.map((o) => (
                  <button
                    key={o}
                    onClick={() => setField("avatarSubtype", o)}
                    className={`px-4 py-2 rounded-xl text-sm border capitalize transition-all ${
                      form.avatarSubtype === o
                        ? "border-accent bg-accent/10 text-[#F0EDE8]"
                        : "border-[#222] text-[#6b6b6b] hover:border-[#333]"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6b6b6b] mb-2">Color de marca</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.brandColor} onChange={(e) => setField("brandColor", e.target.value)} className="w-10 h-10 rounded-lg border border-[#222] cursor-pointer bg-transparent" />
                <input value={form.brandColor} onChange={(e) => setField("brandColor", e.target.value)} className={`${inputClass} flex-1`} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#6b6b6b] mb-2">Color secundario</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.brandColor2} onChange={(e) => setField("brandColor2", e.target.value)} className="w-10 h-10 rounded-lg border border-[#222] cursor-pointer bg-transparent" />
                <input value={form.brandColor2} onChange={(e) => setField("brandColor2", e.target.value)} className={`${inputClass} flex-1`} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#6b6b6b] mb-2">URL del logo (opcional)</label>
            <input value={form.logoUrl} onChange={(e) => setField("logoUrl", e.target.value)} placeholder="https://tuempresa.com/logo.png" className={inputClass} />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 border border-[#333] text-[#6b6b6b] font-medium py-3 rounded-xl hover:border-[#555] transition-colors">
              ← Atrás
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 bg-accent text-white font-medium py-3 rounded-xl hover:bg-accent/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creando...</>
              ) : (
                "Crear agente →"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Install */}
      {step === 3 && createdSiteId && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h2 className="font-syne font-bold text-xl text-[#F0EDE8]">¡Agente creado!</h2>
              <p className="text-sm text-[#6b6b6b]">Instalalo en tu sitio con una línea de código.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#6b6b6b] mb-3">Pegá este código en tu web:</label>
            <div className="relative">
              <pre className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl p-4 text-xs text-[#F0EDE8] font-mono overflow-x-auto">
                <code>{`<script>
  window.MEETZYCONFIG = { siteId: "${createdSiteId}" };
</script>
<script src="${process.env.NEXT_PUBLIC_APP_URL ?? "https://app.meetzy.ai"}/widget.js" async></script>`}</code>
              </pre>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/dashboard/${createdSiteId}`)}
              className="flex-1 border border-[#333] text-[#F0EDE8] font-medium py-3 rounded-xl hover:border-[#555] transition-colors"
            >
              Ir al dashboard
            </button>
            <button
              onClick={() => router.push(`/dashboard/${createdSiteId}`)}
              className="flex-1 bg-accent text-white font-medium py-3 rounded-xl hover:bg-accent/90 transition-colors"
            >
              Probar mi agente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
