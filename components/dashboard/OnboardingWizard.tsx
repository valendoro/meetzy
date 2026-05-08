"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InstallSnippet from "@/components/dashboard/InstallSnippet";

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
  agentType: "vendedor" | "guia" | "soporte" | "recepcionista";
}

const AGENT_TYPE_CARDS = [
  {
    type: "vendedor" as const,
    label: "Vendedor",
    desc: "Convierte visitas en oportunidades y responde objeciones.",
    emoji: "🛒",
  },
  {
    type: "guia" as const,
    label: "Guía / onboarding",
    desc: "Da la bienvenida y orienta a nuevos usuarios.",
    emoji: "🧭",
  },
  {
    type: "soporte" as const,
    label: "Soporte",
    desc: "Resuelve dudas técnicas y guía paso a paso.",
    emoji: "🛟",
  },
  {
    type: "recepcionista" as const,
    label: "Recepción",
    desc: "Filtra consultas y deriva al equipo humano.",
    emoji: "💬",
  },
];

const ROLE_BY_TYPE: Record<FormData["agentType"], string> = {
  vendedor: "vendedor",
  guia: "guía de bienvenida",
  soporte: "soporte técnico",
  recepcionista: "asistente virtual",
};

const PERSONALITIES: { value: string; label: string }[] = [
  { value: "amigable y profesional", label: "Amigable y profesional" },
  { value: "formal y serio", label: "Formal y serio" },
  { value: "divertido y casual", label: "Divertido y casual" },
  { value: "empático y cercano", label: "Empático y cercano" },
];

const AVATAR_TYPES = [
  { id: "human_male", type: "human", label: "Humano ♂", emoji: "👨" },
  { id: "human_female", type: "human", label: "Humano ♀", emoji: "👩" },
  { id: "animal", type: "animal", label: "Animal", emoji: "🐶" },
  { id: "object", type: "object", label: "Objeto / mascota", emoji: "⭐" },
];

const ANIMAL_SUBTYPES = ["perro", "gato", "conejo", "pájaro", "zorro"];
const OBJECT_SUBTYPES = ["taza", "naranja", "manzana", "caja", "estrella"];

const STEPS = ["URL", "Agente", "Avatar", "Instalar"];

const SCRAPE_PHASES = ["Conectando con tu sitio…", "Extrayendo contenido…", "Generando contexto del agente…"];

function tagsFromPreview(preview: string, siteName: string): string[] {
  const t = `${preview} ${siteName}`.toLowerCase();
  const out: string[] = [];
  const rules: [RegExp, string][] = [
    [/shop|carrito|ecommerce|tienda|precio|comprar|checkout/, "E-commerce"],
    [/saas|software|api|integración|dashboard|plataforma/, "SaaS / tech"],
    [/restaurante|menú|reserva|hotel|turno|cita/, "Servicios locales"],
    [/curso|academia|ebook|blog|newsletter|suscripción/, "Contenido / edu"],
  ];
  for (const [re, label] of rules) {
    if (re.test(t)) out.push(label);
  }
  if (out.length === 0) out.push("Contenido general");
  return [...new Set(out)].slice(0, 4);
}

export default function OnboardingWizard({ userPlan }: OnboardingWizardProps) {
  const router = useRouter();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.meetzy.ai";
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdSiteId, setCreatedSiteId] = useState("");
  const [scrapePhase, setScrapePhase] = useState(0);

  const [form, setForm] = useState<FormData>({
    url: "",
    siteName: "",
    systemPrompt: "",
    detectedLanguage: "es",
    preview: "",
    agentName: "Asistente",
    agentRole: ROLE_BY_TYPE.guia,
    agentPersonality: "amigable y profesional",
    welcomeMessage: "¡Hola! ¿En qué te puedo ayudar hoy?",
    avatarType: "",
    avatarSubtype: "",
    brandColor: "#6366f1",
    brandColor2: "#fb7185",
    logoUrl: "",
    embedMode: "widget",
    primaryQuestion: "",
    agentType: "guia",
  });

  const isPro = userPlan === "pro" || userPlan === "elite";
  const insightTags =
    step >= 1 && (form.preview || form.siteName) ? tagsFromPreview(form.preview, form.siteName) : [];

  useEffect(() => {
    if (!loading || step !== 0) return;
    setScrapePhase(0);
    const id = window.setInterval(() => {
      setScrapePhase((p) => (p + 1) % SCRAPE_PHASES.length);
    }, 1400);
    return () => window.clearInterval(id);
  }, [loading, step]);

  function setField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function pickAgentType(type: FormData["agentType"]) {
    setForm((prev) => ({
      ...prev,
      agentType: type,
      agentRole: ROLE_BY_TYPE[type],
    }));
  }

  const applyScrape = useCallback((data: ScrapeResult) => {
    setForm((prev) => ({
      ...prev,
      siteName: data.siteName,
      systemPrompt: data.systemPrompt,
      detectedLanguage: data.detectedLanguage,
      preview: data.preview,
      agentName: prev.agentName,
    }));
  }, []);

  async function runScrape(advanceToAgentStep: boolean) {
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
      applyScrape(data);
      if (advanceToAgentStep) setStep(1);
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
          agentType: form.agentType,
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

  const inputClass = "onboard-input";

  return (
    <div className="w-full pb-20">
      <div className="mb-11 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex min-w-0 flex-1 items-center gap-2.5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-syne text-xs font-bold transition-all ${
                i < step
                  ? "bg-[var(--accent)] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset,0_4px_22px_var(--accent-glow)]"
                  : i === step
                    ? "bg-[var(--accent-subtle)] text-[var(--accent)] ring-2 ring-[rgba(99,102,241,0.55)] ring-offset-2 ring-offset-[var(--bg-base)]"
                    : "border border-[var(--border-strong)] bg-[var(--bg-overlay)] text-[rgba(243,241,236,0.48)]"
              }`}
            >
              {i < step ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`hidden min-w-0 truncate text-sm md:block ${
                i === step
                  ? "font-semibold text-[var(--text-primary)]"
                  : i < step
                    ? "text-[rgba(243,241,236,0.55)]"
                    : "text-[rgba(243,241,236,0.42)]"
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 ? (
              <div
                className={`mx-1 hidden h-px min-w-[12px] flex-1 sm:block ${i < step ? "bg-[var(--accent)]/60" : "bg-[var(--border-strong)]"}`}
              />
            ) : null}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="onboard-card flex flex-col gap-10">
          <header className="space-y-2">
            <h2 className="font-syne text-xl font-bold tracking-tight text-[var(--text-primary)] md:text-2xl">
              ¿Cuál es la URL de tu sitio?
            </h2>
            <p className="onboard-subtle max-w-xl">
              Analizamos el contenido público y preparamos el contexto de tu agente.
            </p>
          </header>

          <section className="flex flex-col gap-3">
            <label className="onboard-field-label">Modo del agente</label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch">
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
                  desc: "La conversación puede ocupar toda la vista",
                  icon: "⚡",
                  badge: "Nuevo",
                },
              ].map((mode) => {
                const active = form.embedMode === mode.value;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setField("embedMode", mode.value as "widget" | "fullpage")}
                    className={`relative flex h-full min-h-[148px] flex-col rounded-[var(--radius-lg)] border border-solid p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(99,102,241,0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] ${
                      active
                        ? "border-[rgba(99,102,241,0.65)] bg-[var(--accent-subtle)] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.28),0_0_24px_rgba(99,102,241,0.12)]"
                        : "border-[var(--border-strong)] bg-[var(--bg-overlay)] hover:border-[rgba(99,102,241,0.35)] hover:bg-[var(--bg-surface)]"
                    }`}
                  >
                    {mode.badge ? (
                      <span className="badge absolute right-3 top-3 py-0.5 pl-2 pr-2 text-[10px]">{mode.badge}</span>
                    ) : null}
                    <span className="mb-3 text-2xl" aria-hidden>
                      {mode.icon}
                    </span>
                    <p className={`font-syne text-sm font-semibold ${active ? "text-[var(--text-primary)]" : "text-[rgba(243,241,236,0.72)]"}`}>
                      {mode.label}
                    </p>
                    <p className={`mt-2 flex-1 text-xs leading-snug ${active ? "text-[rgba(243,241,236,0.58)]" : "text-[rgba(243,241,236,0.48)]"}`}>
                      {mode.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-2 border-t border-[var(--border-default)] pt-10">
            <label className="onboard-field-label">URL del sitio</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setField("url", e.target.value)}
              placeholder="https://miempresa.com"
              className={inputClass}
              onKeyDown={(e) => e.key === "Enter" && !loading && form.url && void runScrape(true)}
            />
          </section>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="flex flex-col gap-2">
            {loading ? (
              <p className="text-sm text-[rgba(243,241,236,0.55)]">{SCRAPE_PHASES[scrapePhase]}</p>
            ) : null}
            <button type="button" onClick={() => void runScrape(true)} disabled={!form.url || loading} className="onboard-primary-cta">
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  Analizando…
                </>
              ) : (
                <>Analizar sitio →</>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="onboard-card space-y-6">
          <header className="space-y-3">
            <h2 className="font-syne text-xl font-bold tracking-tight text-[var(--text-primary)] md:text-2xl">Configurá tu agente</h2>
            {insightTags.length ? (
              <div className="flex flex-wrap gap-2">
                {insightTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[rgba(99,102,241,0.35)] bg-[var(--accent-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--accent)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            {form.preview ? (
              <p className="onboard-subtle rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
                {form.preview}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void runScrape(false)}
              disabled={loading || !form.url}
              className="btn-ghost btn-ghost--sm self-start !px-0 !py-0 text-[var(--accent)] hover:underline"
            >
              {loading ? "Releyendo sitio…" : "↻ Regenerar desde la web"}
            </button>
          </header>

          <div>
            <label className="onboard-field-label mb-3 block">Tipo de agente</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {AGENT_TYPE_CARDS.map((c) => {
                const active = form.agentType === c.type;
                return (
                  <button
                    key={c.type}
                    type="button"
                    onClick={() => pickAgentType(c.type)}
                    className={`flex flex-col gap-2 rounded-[var(--radius-lg)] border border-solid p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(99,102,241,0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] ${
                      active
                        ? "border-[rgba(99,102,241,0.65)] bg-[var(--accent-subtle)] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.25)]"
                        : "border-[var(--border-strong)] bg-[var(--bg-overlay)] hover:border-[rgba(99,102,241,0.35)]"
                    }`}
                  >
                    <span className="text-xl" aria-hidden>
                      {c.emoji}
                    </span>
                    <span className={`font-syne text-sm font-semibold ${active ? "text-[var(--text-primary)]" : "text-[rgba(243,241,236,0.72)]"}`}>
                      {c.label}
                    </span>
                    <span className="text-xs leading-snug text-[rgba(243,241,236,0.5)]">{c.desc}</span>
                  </button>
                );
              })}
            </div>
            <p className="onboard-hint mt-2">
              Rol sugerido: <span className="text-[var(--text-primary)]">{form.agentRole}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="onboard-field-label">Nombre del agente</label>
              <input value={form.agentName} onChange={(e) => setField("agentName", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="onboard-field-label">Nombre del sitio</label>
              <input value={form.siteName} onChange={(e) => setField("siteName", e.target.value)} className={inputClass} />
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="onboard-field-label mb-2">Personalidad</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PERSONALITIES.map((p) => (
                <label
                  key={p.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border border-solid p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[rgba(99,102,241,0.55)] ${
                    form.agentPersonality === p.value
                      ? "border-[rgba(99,102,241,0.55)] bg-[var(--accent-subtle)]"
                      : "border-[var(--border-strong)] bg-[var(--bg-elevated)] hover:border-[rgba(99,102,241,0.3)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="personality"
                    value={p.value}
                    checked={form.agentPersonality === p.value}
                    onChange={() => setField("agentPersonality", p.value)}
                    className="mt-1 accent-[var(--accent)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">{p.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label className="onboard-field-label">Mensaje de bienvenida</label>
            <input value={form.welcomeMessage} onChange={(e) => setField("welcomeMessage", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="onboard-field-label">Instrucciones del agente</label>
            <p className="onboard-hint mb-2">Generado desde tu web. Editá si querés afinar el tono o las reglas.</p>
            <textarea
              value={form.systemPrompt}
              onChange={(e) => setField("systemPrompt", e.target.value)}
              rows={8}
              className={`${inputClass} min-h-[180px] resize-none`}
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <button type="button" onClick={() => setStep(0)} className="btn-ghost flex-1 !py-3.5">
              ← Atrás
            </button>
            <button
              type="button"
              onClick={() => {
                if (isPro) setStep(2);
                else void handleCreate();
              }}
              disabled={!form.systemPrompt || loading}
              className="onboard-primary-cta"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creando…
                </>
              ) : isPro ? (
                "Elegir avatar →"
              ) : (
                "Crear agente →"
              )}
            </button>
          </div>
        </div>
      )}

      {step === 2 && !isPro && (
        <div className="onboard-card space-y-6">
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-[rgba(99,102,241,0.35)] bg-[var(--accent-subtle)]">
              <Lock className="size-7 text-[var(--accent)]" aria-hidden />
            </div>
            <h2 className="font-syne text-xl font-bold text-[var(--text-primary)] md:text-2xl">Avatar avanzado</h2>
            <p className="onboard-subtle mt-2 max-w-md">
              Los avatares con estilo de marca están en planes <strong className="text-[var(--text-primary)]">Pro</strong> o superiores.
              Podés crear el agente ya y sumar el avatar después.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[rgba(99,102,241,0.4)] bg-[var(--accent-subtle)] px-4 py-3 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[rgba(99,102,241,0.18)]"
            >
              <Sparkles className="size-4" aria-hidden />
              Ver planes
            </Link>
            <button type="button" onClick={() => void handleCreate()} disabled={loading} className="onboard-primary-cta flex-1">
              {loading ? "Creando…" : "Continuar sin avatar"}
            </button>
          </div>
          <button type="button" onClick={() => setStep(1)} className="btn-ghost w-full !py-3.5">
            ← Volver al agente
          </button>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>
      )}

      {step === 2 && isPro && (
        <div className="onboard-card space-y-8">
          <header className="space-y-2">
            <h2 className="font-syne text-xl font-bold tracking-tight text-[var(--text-primary)] md:text-2xl">Elegí el avatar</h2>
            <p className="onboard-subtle">El avatar puede reflejar los colores y logo de tu marca.</p>
          </header>

          <div>
            <label className="onboard-field-label">Tipo de personaje</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {AVATAR_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setField("avatarType", t.type);
                    setField("avatarSubtype", t.id === "human_male" ? "male" : t.id === "human_female" ? "female" : "");
                  }}
                  className={`flex items-center gap-3 rounded-[var(--radius-lg)] border border-solid p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(99,102,241,0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] ${
                    form.avatarType === t.type &&
                    (t.type !== "human" || form.avatarSubtype === (t.id === "human_male" ? "male" : "female"))
                      ? "border-[rgba(99,102,241,0.65)] bg-[var(--accent-subtle)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.25)]"
                      : "border-[var(--border-strong)] bg-[var(--bg-overlay)] text-[rgba(243,241,236,0.65)] hover:border-[rgba(99,102,241,0.35)]"
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
              <label className="onboard-field-label">¿Qué animal?</label>
              <div className="flex flex-wrap gap-2">
                {ANIMAL_SUBTYPES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setField("avatarSubtype", a)}
                    className={`rounded-[var(--radius-md)] border border-solid px-4 py-2 text-sm capitalize transition-colors ${
                      form.avatarSubtype === a
                        ? "border-[rgba(99,102,241,0.6)] bg-[var(--accent-subtle)] text-[var(--text-primary)]"
                        : "border-[var(--border-strong)] text-[rgba(243,241,236,0.58)] hover:border-[rgba(99,102,241,0.35)]"
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
              <label className="onboard-field-label">¿Qué objeto?</label>
              <div className="flex flex-wrap gap-2">
                {OBJECT_SUBTYPES.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setField("avatarSubtype", o)}
                    className={`rounded-[var(--radius-md)] border border-solid px-4 py-2 text-sm capitalize transition-colors ${
                      form.avatarSubtype === o
                        ? "border-[rgba(99,102,241,0.6)] bg-[var(--accent-subtle)] text-[var(--text-primary)]"
                        : "border-[var(--border-strong)] text-[rgba(243,241,236,0.58)] hover:border-[rgba(99,102,241,0.35)]"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="onboard-field-label">Color de marca</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.brandColor}
                  onChange={(e) => setField("brandColor", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-transparent"
                />
                <input value={form.brandColor} onChange={(e) => setField("brandColor", e.target.value)} className={`${inputClass} flex-1`} />
              </div>
            </div>
            <div>
              <label className="onboard-field-label">Color secundario</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.brandColor2}
                  onChange={(e) => setField("brandColor2", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-transparent"
                />
                <input value={form.brandColor2} onChange={(e) => setField("brandColor2", e.target.value)} className={`${inputClass} flex-1`} />
              </div>
            </div>
          </div>

          <div>
            <label className="onboard-field-label">URL del logo (opcional)</label>
            <input
              value={form.logoUrl}
              onChange={(e) => setField("logoUrl", e.target.value)}
              placeholder="https://tuempresa.com/logo.png"
              className={inputClass}
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1 !py-3.5">
              ← Atrás
            </button>
            <button type="button" onClick={() => void handleCreate()} disabled={loading} className="onboard-primary-cta">
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creando…
                </>
              ) : (
                "Crear agente →"
              )}
            </button>
          </div>
        </div>
      )}

      {step === 3 && createdSiteId && (
        <div className="onboard-card space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--success)]/12 ring-1 ring-[rgba(61,214,143,0.35)]">
              <svg className="h-7 w-7 text-[var(--success)]" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="font-syne text-xl font-bold text-[var(--text-primary)] md:text-2xl">¡Agente creado!</h2>
              <p className="onboard-subtle mt-1">Instalalo en tu sitio. Te avisamos cuando detectemos el snippet publicado.</p>
            </div>
          </div>

          <InstallSnippet siteId={createdSiteId} appUrl={appUrl} verify />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <button type="button" onClick={() => router.push(`/dashboard/${createdSiteId}`)} className="btn-ghost flex-1 !py-3.5">
              Ir al dashboard
            </button>
            <button type="button" onClick={() => router.push(`/dashboard/${createdSiteId}/install`)} className="onboard-primary-cta">
              Abrir guía de instalación →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
