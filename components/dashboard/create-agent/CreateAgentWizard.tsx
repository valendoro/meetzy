"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  HelpCircle,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import Color from "color";
import AvatarSvgPreview from "@/components/onboarding/AvatarSvgPreview";
import ConfettiCanvas from "@/components/onboarding/ConfettiCanvas";
import { SelectableTile } from "@/components/onboarding/SelectableTile";
import InstallSnippet from "@/components/dashboard/InstallSnippet";
import { resolveArchetype } from "@/components/onboarding/resolve-archetype";
import type { PrimaryChar } from "@/components/onboarding/resolve-archetype";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AvatarArchetype } from "@/lib/avatar-prompt-builder";
import { useProductToast } from "@/components/providers/product-toast";

const LS_KEY = "meetzy-create-agent-wizard-v1";

const SWATCHES = ["#6366f1", "#ec4899", "#f97316", "#22c55e", "#0ea5e9", "#eab308", "#a855f7", "#14b8a6"];

const AGENT_CARDS = [
  { id: "vendedor" as const, emoji: "🛍️", title: "Vendedor", desc: "Detecta interés y empuja a la acción" },
  { id: "guia" as const, emoji: "🗺️", title: "Guía", desc: "Acompaña al visitante mientras navega" },
  { id: "soporte" as const, emoji: "🛠️", title: "Soporte", desc: "Resuelve dudas y problemas técnicos" },
  { id: "recepcionista" as const, emoji: "📅", title: "Recepcionista", desc: "Agenda turnos y deriva consultas" },
];

const FUN_MESSAGES = [
  "Diseñando tu personaje…",
  "Aplicando tu color de marca…",
  "Casi listo…",
  "Ajustando detalles finales…",
];

type MacroStep = 1 | 2 | 3 | 4;
type Personality = "amigable" | "profesional" | "divertida" | "seria";

function needsSecondary(primary: PrimaryChar | null): boolean {
  if (!primary) return false;
  return primary === "human" || primary === "fruta" || primary === "objeto" || primary === "animal";
}

function canProceedSecondary(primary: PrimaryChar | null, subtype: string): boolean {
  if (!primary) return false;
  if (primary === "human") return subtype === "male" || subtype === "female";
  if (primary === "fruta") return ["naranja", "manzana"].includes(subtype);
  if (primary === "objeto") return ["taza", "estrella", "cohete", "diamante"].includes(subtype);
  if (primary === "animal") return ["perro", "gato", "conejo", "zorro", "panda", "oso"].includes(subtype);
  return false;
}

function personalityLabel(p: Personality): string {
  switch (p) {
    case "amigable":
      return "amigable y cercano";
    case "profesional":
      return "profesional y claro";
    case "divertida":
      return "divertida y energética";
    case "seria":
      return "seria y precisa";
    default:
      return "amigable y profesional";
  }
}

type Persisted = {
  macroStep: MacroStep;
  url: string;
  businessName: string;
  agentName: string;
  detectedLanguage: string;
  systemPrompt: string;
  agentType: (typeof AGENT_CARDS)[number]["id"] | null;
  personality: Personality;
  welcomeMessage: string;
  primary: PrimaryChar | null;
  subtype: string;
  brandColor: string;
  brandColor2: string;
  logoUrl: string | null;
  avatarUrl: string | null;
  genFallback: boolean;
  createdSiteId: string | null;
  analyzeSkipped: boolean;
};

export type CreateAgentWizardProps = {
  variant: "modal" | "page";
  userPlan: string;
  isGuest: boolean;
  onRequestClose?: () => void;
};

export default function CreateAgentWizard({ variant, userPlan, isGuest, onRequestClose }: CreateAgentWizardProps) {
  const { push } = useProductToast();
  const [macroStep, setMacroStep] = useState<MacroStep>(1);

  const [url, setUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("es");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [sitePreview, setSitePreview] = useState("");
  const [analyzeBusy, setAnalyzeBusy] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analyzeSkipped, setAnalyzeSkipped] = useState(false);

  const [agentType, setAgentType] = useState<(typeof AGENT_CARDS)[number]["id"] | null>(null);
  const [personality, setPersonality] = useState<Personality>("amigable");
  const [welcomeMessage, setWelcomeMessage] = useState("");

  const [primary, setPrimary] = useState<PrimaryChar | null>(null);
  const [subtype, setSubtype] = useState("");
  const [brandColor, setBrandColor] = useState("#6366f1");
  const [brandColor2, setBrandColor2] = useState("#8b5cf6");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [avatarMicro, setAvatarMicro] = useState<"pick" | "generating" | "done">("pick");

  const [genBusy, setGenBusy] = useState(false);
  const [genMessage, setGenMessage] = useState(FUN_MESSAGES[0] ?? "");
  const genTimer = useRef<number | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [genFallback, setGenFallback] = useState(false);
  const [localRegen, setLocalRegen] = useState(0);
  const [createdSiteId, setCreatedSiteId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [rightTransition, setRightTransition] = useState<"in" | "out">("in");

  const archetype = useMemo(() => resolveArchetype(primary, subtype), [primary, subtype]);
  const agentTypeLabel = useMemo(() => AGENT_CARDS.find((x) => x.id === agentType)?.title ?? "Agente", [agentType]);

  const suggestions = useMemo(() => {
    const base = businessName.trim() || "Marca";
    return [`Lunita`, `${base.split(/\s+/)[0]?.slice(0, 8) || "Max"}`, `Coco`, `Sofia`];
  }, [businessName]);

  const persist = useCallback(() => {
    const payload: Persisted = {
      macroStep,
      url,
      businessName,
      agentName,
      detectedLanguage,
      systemPrompt,
      agentType,
      personality,
      welcomeMessage,
      primary,
      subtype,
      brandColor,
      brandColor2,
      logoUrl,
      avatarUrl,
      genFallback,
      createdSiteId,
      analyzeSkipped,
    };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }, [
    macroStep,
    url,
    businessName,
    agentName,
    detectedLanguage,
    systemPrompt,
    agentType,
    personality,
    welcomeMessage,
    primary,
    subtype,
    brandColor,
    brandColor2,
    logoUrl,
    avatarUrl,
    genFallback,
    createdSiteId,
    analyzeSkipped,
  ]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const p = JSON.parse(raw) as Partial<Persisted>;
      if (p.macroStep === 1 || p.macroStep === 2 || p.macroStep === 3 || p.macroStep === 4) setMacroStep(p.macroStep);
      if (typeof p.url === "string") setUrl(p.url);
      if (typeof p.businessName === "string") setBusinessName(p.businessName);
      if (typeof p.agentName === "string") setAgentName(p.agentName);
      if (typeof p.detectedLanguage === "string") setDetectedLanguage(p.detectedLanguage);
      if (typeof p.systemPrompt === "string") setSystemPrompt(p.systemPrompt);
      if (p.agentType) setAgentType(p.agentType);
      if (p.personality) setPersonality(p.personality);
      if (typeof p.welcomeMessage === "string") setWelcomeMessage(p.welcomeMessage);
      if (p.primary) setPrimary(p.primary);
      if (typeof p.subtype === "string") setSubtype(p.subtype);
      if (typeof p.brandColor === "string") setBrandColor(p.brandColor);
      if (typeof p.brandColor2 === "string") setBrandColor2(p.brandColor2);
      if (typeof p.logoUrl === "string" || p.logoUrl === null) setLogoUrl(p.logoUrl);
      if (typeof p.avatarUrl === "string") setAvatarUrl(p.avatarUrl);
      if (typeof p.genFallback === "boolean") setGenFallback(p.genFallback);
      if (typeof p.createdSiteId === "string") setCreatedSiteId(p.createdSiteId);
      if (typeof p.analyzeSkipped === "boolean") setAnalyzeSkipped(p.analyzeSkipped);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    persist();
  }, [persist]);

  useEffect(() => {
    return () => {
      if (genTimer.current) window.clearInterval(genTimer.current);
    };
  }, []);

  function advanceCharPrimary(p: PrimaryChar) {
    setPrimary(p);
    setSubtype("");
    if (p === "human" || p === "fruta" || p === "objeto" || p === "animal") {
      /* wait for secondary */
    } else {
      setSubtype(p === "perro" ? "perro" : "gato");
    }
  }

  const previewStage = useMemo(() => {
    if (avatarUrl && !genFallback) return "image" as const;
    if (primary && archetype) return "svg" as const;
    return "placeholder" as const;
  }, [avatarUrl, genFallback, primary, archetype]);

  async function runAnalyze() {
    let normalized = url.trim();
    if (!normalized) return;
    if (!normalized.startsWith("http")) normalized = `https://${normalized}`;
    try {
      new URL(normalized);
    } catch {
      push("URL inválida", "error");
      return;
    }
    setAnalyzeBusy(true);
    setAnalyzeError(null);
    try {
      const r = await fetch("/api/onboarding/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });
      const j = (await r.json()) as {
        systemPrompt?: string;
        detectedLanguage?: string;
        siteName?: string;
        preview?: string;
        error?: string;
      };
      if (!r.ok) {
        setAnalyzeError(j.error ?? "No pudimos leer el sitio.");
        return;
      }
      if (j.systemPrompt) setSystemPrompt(j.systemPrompt);
      if (j.detectedLanguage) setDetectedLanguage(j.detectedLanguage);
      if (j.siteName && !businessName.trim()) setBusinessName(j.siteName);
      if (j.preview) setSitePreview(j.preview);
      setAnalyzeSkipped(false);
      push("Sitio analizado ✓", "success");
    } catch {
      setAnalyzeError("Error de red al analizar.");
    } finally {
      setAnalyzeBusy(false);
    }
  }

  async function runGeneration(variation: number, options?: { soft?: boolean }) {
    if (!archetype) {
      push("Completá el personaje antes de generar.", "warning");
      return;
    }
    setGenBusy(true);
    if (!options?.soft) {
      setGenFallback(false);
      setAvatarUrl(null);
    }
    const t0 = Date.now();
    try {
      const r = await fetch("/api/avatar/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archetype,
          brandColor,
          brandColor2,
          businessName: businessName || "tu marca",
          agentName: agentName || "Asistente",
          logoUrl: logoUrl || undefined,
          variation,
        }),
      });
      const j = (await r.json()) as { avatarUrl?: string | null; fallback?: boolean; error?: string };
      const wait = Math.max(0, 2800 - (Date.now() - t0));
      await new Promise((res) => setTimeout(res, wait));
      if (j.avatarUrl) {
        setAvatarUrl(j.avatarUrl);
        setGenFallback(Boolean(j.fallback));
      } else {
        setGenFallback(true);
        setAvatarUrl(null);
        push(j.error ? "Usamos el preview vectorial ✓" : "Seguimos con el avatar ilustrado local.", "info");
      }
    } catch {
      setGenFallback(true);
      push("Generación en pausa — usando preview local.", "warning");
    } finally {
      setGenBusy(false);
    }
  }

  function startGenerationPhase() {
    if (!archetype) {
      push("Elegí tipo de personaje y variante.", "warning");
      return;
    }
    if (isGuest) {
      persist();
      window.location.href = `/sign-up?redirect_url=${encodeURIComponent("/dashboard/new")}`;
      return;
    }
    setAvatarMicro("generating");
    let i = 0;
    genTimer.current = window.setInterval(() => {
      i = (i + 1) % FUN_MESSAGES.length;
      setGenMessage(FUN_MESSAGES[i] ?? "");
    }, 2800);
    void (async () => {
      try {
        await runGeneration(localRegen);
      } finally {
        if (genTimer.current) {
          window.clearInterval(genTimer.current);
          genTimer.current = null;
        }
        setAvatarMicro("done");
      }
    })();
  }

  async function finalizeSite() {
    if (!archetype || !agentType) return;
    let normalized = url.trim();
    if (!normalized.startsWith("http")) normalized = `https://${normalized}`;
    const img = avatarUrl && !genFallback ? avatarUrl : null;
    const r = await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: businessName.trim(),
        url: normalized,
        agentName: agentName.trim(),
        brandColor,
        brandColor2,
        logoUrl,
        avatarImageUrl: img,
        archetype: archetype as AvatarArchetype,
        agentType,
        systemPrompt: systemPrompt.trim() || "Sos un asistente amable de la marca.",
        detectedLanguage,
        embedMode: "widget",
        welcomeMessage: welcomeMessage.trim() || `¡Hola! Soy ${agentName.trim() || "tu asistente"}. ¿En qué te puedo ayudar?`,
        agentPersonality: personalityLabel(personality),
      }),
    });
    const j = (await r.json()) as { siteId?: string; error?: string };
    if (!r.ok) {
      push(j.error ?? "Error al crear el sitio", "error");
      return;
    }
    setCreatedSiteId(j.siteId ?? null);
    setCelebrate(true);
    window.setTimeout(() => setCelebrate(false), 2200);
    setMacroStep(4);
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
  }

  const dirty = macroStep > 1 || url.trim().length > 0 || businessName.trim().length > 0 || agentName.trim().length > 0;

  function requestClose() {
    if (!onRequestClose) return;
    if (dirty && macroStep < 4) {
      if (!window.confirm("¿Cerrar? Perdés el progreso no guardado en esta sesión (se guarda en este dispositivo).")) return;
    }
    onRequestClose();
  }

  function goNext() {
    setRightTransition("out");
    window.setTimeout(() => {
      setMacroStep((s) => (s < 4 ? ((s + 1) as MacroStep) : s));
      setRightTransition("in");
    }, 180);
  }

  function goBack() {
    setRightTransition("out");
    window.setTimeout(() => {
      setMacroStep((s) => (s > 1 ? ((s - 1) as MacroStep) : s));
      setRightTransition("in");
    }, 180);
  }

  const canProceedForward = useMemo(() => {
    if (macroStep === 1) {
      if (!url.trim() || !businessName.trim() || !agentName.trim()) return false;
      if (analyzeError && !analyzeSkipped) return false;
      if (!systemPrompt.trim() && !analyzeSkipped) return false;
      return true;
    }
    if (macroStep === 2) return Boolean(agentType);
    if (macroStep === 3) {
      if (!primary) return false;
      if (needsSecondary(primary) && !canProceedSecondary(primary, subtype)) return false;
      if (avatarMicro !== "done") return false;
      return true;
    }
    return false;
  }, [
    macroStep,
    url,
    businessName,
    agentName,
    analyzeError,
    analyzeSkipped,
    systemPrompt,
    agentType,
    welcomeMessage,
    primary,
    subtype,
    avatarMicro,
  ]);

  const canPickGenerate = useMemo(() => {
    if (!primary) return false;
    if (needsSecondary(primary) && !canProceedSecondary(primary, subtype)) return false;
    return avatarMicro === "pick";
  }, [primary, subtype, avatarMicro]);

  function onPrimaryAction() {
    if (macroStep === 1) {
      goNext();
      return;
    }
    if (macroStep === 2) {
      goNext();
      return;
    }
    if (macroStep === 3) {
      if (avatarMicro === "pick") {
        startGenerationPhase();
        return;
      }
      if (avatarMicro === "done") {
        void finalizeSite();
      }
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.meetzy.ai";
  const stepMeta = [
    { n: 1, title: "Tu negocio", desc: "URL y nombre" },
    { n: 2, title: "Tu agente", desc: "Tipo y personalidad" },
    { n: 3, title: "Tu avatar", desc: "Identidad visual" },
    { n: 4, title: "Instalación", desc: "Código listo" },
  ] as const;

  const stepStatus = (n: number) => {
    if (n < macroStep) return "done" as const;
    if (n === macroStep) return "active" as const;
    return "pending" as const;
  };

  const rightPanelClass =
    rightTransition === "in"
      ? "opacity-100 translate-x-0 transition-all duration-[250ms]"
      : "opacity-0 -translate-x-5 transition-all duration-200";

  const shell = (
    <>
      <ConfettiCanvas active={celebrate} />
      <div
        className={
          variant === "modal"
            ? "relative flex max-h-[min(620px,90vh)] w-full max-w-[780px] flex-col overflow-hidden rounded-t-[22px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[0_24px_80px_rgba(0,0,0,0.7)] md:rounded-[24px]"
            : "relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-[var(--bg-base)]"
        }
      >
        {variant === "page" ? (
          <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--text-primary)]"
            >
              ← Volver
            </Link>
            <span className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Plan {userPlan}
            </span>
          </header>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <aside className="hidden w-[280px] shrink-0 flex-col border-b border-[var(--border-subtle)] bg-[var(--bg-base)] md:flex md:border-b-0 md:border-r md:border-[var(--border-subtle)]">
            <div className="p-7">
              <h2 className="font-syne text-lg font-bold tracking-[-0.02em] text-[var(--text-primary)]">Nuevo agente</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-tertiary)]">Configurá tu agente en minutos</p>
            </div>
            <nav className="flex flex-1 flex-col gap-3 px-6 pb-6" aria-label="Pasos">
              {stepMeta.map((s, idx) => {
                const st = stepStatus(s.n);
                return (
                  <div key={s.n} className="relative flex gap-3">
                    {idx < stepMeta.length - 1 ? (
                      <div
                        className="absolute left-[13px] top-8 h-[calc(100%+6px)] w-0.5 rounded-full bg-[var(--border-subtle)]"
                        aria-hidden
                      >
                        <div
                          className="absolute top-0 left-0 w-full rounded-full bg-[var(--accent)] transition-all duration-300"
                          style={{ height: st === "done" ? "100%" : "0%" }}
                        />
                      </div>
                    ) : null}
                    <div
                      className={`relative z-[1] flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        st === "active"
                          ? "bg-[var(--accent)] text-white shadow-[0_0_20px_var(--accent-glow)]"
                          : st === "done"
                            ? "border border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.15)] text-[var(--success)]"
                            : "border border-[var(--border-default)] text-[var(--text-tertiary)]"
                      }`}
                    >
                      {st === "done" ? <Check className="size-3.5" strokeWidth={3} /> : s.n}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          st === "active" ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"
                        }`}
                      >
                        {s.title}
                      </p>
                      <p className="text-[11px] text-[var(--text-tertiary)]">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </nav>
            <div className="mt-auto border-t border-[var(--border-subtle)] p-6">
              <button type="button" className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] transition-colors duration-150 hover:text-[var(--accent)]">
                <HelpCircle className="size-3.5" />
                ¿Necesitás ayuda?
              </button>
            </div>
          </aside>

          <div className="relative flex min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col md:flex-row">
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-7 pb-28 md:px-8 md:py-8 md:pb-24">
                <div className={rightPanelClass}>
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                    Paso {macroStep} de 4
                  </p>
                  {macroStep === 1 ? (
                    <StepBusiness
                      url={url}
                      setUrl={setUrl}
                      businessName={businessName}
                      setBusinessName={setBusinessName}
                      agentName={agentName}
                      setAgentName={setAgentName}
                      detectedLanguage={detectedLanguage}
                      setDetectedLanguage={setDetectedLanguage}
                      analyzeBusy={analyzeBusy}
                      analyzeError={analyzeError}
                      setAnalyzeError={setAnalyzeError}
                      analyzeSkipped={analyzeSkipped}
                      setAnalyzeSkipped={setAnalyzeSkipped}
                      sitePreview={sitePreview}
                      systemPrompt={systemPrompt}
                      setSystemPrompt={setSystemPrompt}
                      suggestions={suggestions}
                      onAnalyze={() => void runAnalyze()}
                    />
                  ) : null}
                  {macroStep === 2 ? (
                    <StepAgent
                      agentType={agentType}
                      setAgentType={setAgentType}
                      personality={personality}
                      setPersonality={setPersonality}
                      welcomeMessage={welcomeMessage}
                      setWelcomeMessage={setWelcomeMessage}
                      agentName={agentName}
                    />
                  ) : null}
                  {macroStep === 3 ? (
                    <StepAvatarPick
                      primary={primary}
                      advanceCharPrimary={advanceCharPrimary}
                      subtype={subtype}
                      setSubtype={setSubtype}
                      brandColor={brandColor}
                      setBrandColor={setBrandColor}
                      brandColor2={brandColor2}
                      setBrandColor2={setBrandColor2}
                      logoUrl={logoUrl}
                      setLogoUrl={setLogoUrl}
                      avatarMicro={avatarMicro}
                      genBusy={genBusy}
                      genMessage={genMessage}
                    />
                  ) : null}
                  {macroStep === 4 && createdSiteId ? (
                    <StepInstall
                      agentName={agentName}
                      avatarUrl={avatarUrl}
                      genFallback={genFallback}
                      brandColor={brandColor}
                      url={url}
                      createdSiteId={createdSiteId}
                      appUrl={appUrl}
                    />
                  ) : null}
                </div>
              </div>

              {macroStep === 3 ? (
                <div className="hidden w-[38%] shrink-0 border-l border-[var(--border-subtle)] bg-[var(--bg-base)] p-5 md:block">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">Preview</p>
                  <div className="mt-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-4">
                    <AvatarSvgPreview
                      stage={previewStage}
                      archetype={archetype}
                      brandColor={brandColor}
                      businessName={businessName}
                      agentName={agentName || "Tu agente"}
                      agentTypeLabel={agentTypeLabel}
                      logoUrl={logoUrl}
                      imageUrl={avatarUrl}
                    />
                    {avatarMicro === "done" ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="gap-1"
                          disabled={localRegen >= 3 || genBusy}
                          onClick={() => {
                            const next = localRegen + 1;
                            setLocalRegen(next);
                            void runGeneration(next, { soft: true });
                          }}
                        >
                          <RefreshCw className="size-3.5" />
                          Regenerar
                        </Button>
                        <Button type="button" size="sm" className="gap-1 bg-[var(--success)] hover:bg-[var(--success)]/90" onClick={() => void finalizeSite()}>
                          Me encanta ✓
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            {macroStep < 4 ? (
              <footer className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 px-4 py-3 backdrop-blur-md md:static md:bg-[var(--bg-surface)] md:px-8">
                <div>
                  {macroStep > 1 ? (
                    <Button type="button" variant="ghost" className="dash-focus-ring text-[var(--text-secondary)]" onClick={goBack}>
                      <ChevronLeft className="mr-1 size-4" />
                      Atrás
                    </Button>
                  ) : (
                    <span />
                  )}
                </div>
                <Button
                  type="button"
                  disabled={
                    (macroStep === 1 && !canProceedForward) ||
                    (macroStep === 2 && !canProceedForward) ||
                    (macroStep === 3 && avatarMicro === "generating") ||
                    (macroStep === 3 && avatarMicro === "pick" && !canPickGenerate) ||
                    (macroStep === 3 && avatarMicro === "done")
                  }
                  className="dash-focus-ring gap-2 rounded-[10px] bg-[var(--accent)] px-5 hover:bg-[var(--accent-hover)]"
                  onClick={() => onPrimaryAction()}
                >
                  {macroStep === 3 && avatarMicro === "pick" ? (
                    <>
                      <Sparkles className="size-4" />
                      Generar mi avatar
                    </>
                  ) : macroStep === 3 && avatarMicro === "generating" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Generando…
                    </>
                  ) : (
                    <>
                      Continuar
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </footer>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );

  if (variant === "page") {
    return <>{shell}</>;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center md:items-center" role="dialog" aria-modal="true">
      <button
        type="button"
        className="dash-modal-overlay absolute inset-0 cursor-default border-0"
        aria-label="Cerrar"
        onClick={requestClose}
      />
      <div className="dash-modal-panel relative z-[2] w-full md:mx-4">{shell}</div>
      <button
        type="button"
        className="absolute right-4 top-4 z-[3] rounded-lg p-2 text-[var(--text-tertiary)] transition-colors duration-150 hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] md:right-6 md:top-6"
        onClick={requestClose}
        aria-label="Cerrar"
      >
        <X className="size-5" />
      </button>
    </div>
  );
}

function StepBusiness({
  url,
  setUrl,
  businessName,
  setBusinessName,
  agentName,
  setAgentName,
  detectedLanguage,
  setDetectedLanguage,
  analyzeBusy,
  analyzeError,
  setAnalyzeError,
  analyzeSkipped,
  setAnalyzeSkipped,
  sitePreview,
  systemPrompt,
  setSystemPrompt,
  suggestions,
  onAnalyze,
}: {
  url: string;
  setUrl: (v: string) => void;
  businessName: string;
  setBusinessName: (v: string) => void;
  agentName: string;
  setAgentName: (v: string) => void;
  detectedLanguage: string;
  setDetectedLanguage: (v: string) => void;
  analyzeBusy: boolean;
  analyzeError: string | null;
  setAnalyzeError: (v: string | null) => void;
  analyzeSkipped: boolean;
  setAnalyzeSkipped: (v: boolean) => void;
  sitePreview: string;
  systemPrompt: string;
  setSystemPrompt: (v: string) => void;
  suggestions: string[];
  onAnalyze: () => void;
}) {
  const analyzedOk = systemPrompt.trim().length > 0 && !analyzeError;
  return (
    <div className="mt-6 space-y-8">
      <div>
        <h3 className="font-syne text-[22px] font-bold tracking-[-0.02em] text-[var(--text-primary)]">¿Dónde vive tu negocio?</h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Probá analizar la web para que el agente conozca tu oferta.</p>
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)]">URL de tu sitio web</label>
        <div
          className={`mt-2 flex gap-2 rounded-[10px] border bg-[var(--bg-elevated)] p-1 transition-[border-color,box-shadow] duration-200 ${
            analyzeBusy ? "border-[var(--accent)] shadow-[0_0_0_1px_rgba(99,102,241,0.35)]" : "border-[var(--border-default)]"
          }`}
        >
          <div className="flex flex-1 items-center gap-2 px-2">
            <LinkIcon className="size-4 shrink-0 text-[var(--text-tertiary)]" />
            <Input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setAnalyzeError(null);
              }}
              placeholder="https://tusitio.com"
              className="h-11 border-0 bg-transparent text-[var(--text-primary)] focus-visible:ring-0"
            />
          </div>
          <Button
            type="button"
            className="h-11 shrink-0 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
            disabled={analyzeBusy || !url.trim()}
            onClick={onAnalyze}
          >
            {analyzeBusy ? <Loader2 className="size-4 animate-spin" /> : "Analizar →"}
          </Button>
        </div>
      </div>

      {analyzedOk ? (
        <div className="rounded-xl border border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.06)] p-4">
          <p className="text-sm font-medium text-[var(--success)]">✓ Sitio leído correctamente</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{sitePreview.slice(0, 240)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Contexto detectado", "Páginas clave", "Listo para charlar"].map((t) => (
              <span key={t} className="rounded-full border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.1)] px-2.5 py-0.5 text-[11px] text-[var(--success)]">
                {t}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {analyzeError ? (
        <div className="rounded-xl border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.06)] p-4">
          <p className="text-sm text-[var(--error)]">{analyzeError}</p>
          <button
            type="button"
            className="mt-3 text-xs font-medium text-[var(--accent)] underline transition-colors hover:text-[var(--accent-hover)]"
            onClick={() => {
              setAnalyzeSkipped(true);
              setAnalyzeError(null);
              if (!systemPrompt.trim()) {
                setSystemPrompt(
                  "Sos un asistente amable que representa el negocio del sitio web del cliente. Respondé con claridad y en el idioma del visitante.",
                );
              }
            }}
          >
            Continuar igualmente
          </button>
        </div>
      ) : null}

      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)]">Nombre del negocio</label>
        <Input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="mt-2 h-11 border-[var(--border-default)] bg-[var(--bg-elevated)]"
          placeholder="Ej. Café del Sol"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)]">¿Cómo se va a llamar tu agente?</label>
        <Input
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          className="mt-2 h-11 border-[var(--border-default)] bg-[var(--bg-elevated)]"
          placeholder="Luna, Max, Coco, Sofia…"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-xs text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--accent-border)] hover:bg-[var(--accent-subtle)] hover:text-[var(--text-primary)]"
              onClick={() => setAgentName(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)]">¿En qué idioma responde tu agente?</label>
        <select
          value={detectedLanguage}
          onChange={(e) => setDetectedLanguage(e.target.value)}
          className="dash-focus-ring mt-2 h-11 w-full rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] transition-colors duration-150"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="pt">Português</option>
        </select>
      </div>
    </div>
  );
}

function StepAgent({
  agentType,
  setAgentType,
  personality,
  setPersonality,
  welcomeMessage,
  setWelcomeMessage,
  agentName,
}: {
  agentType: (typeof AGENT_CARDS)[number]["id"] | null;
  setAgentType: (v: (typeof AGENT_CARDS)[number]["id"] | null) => void;
  personality: Personality;
  setPersonality: (v: Personality) => void;
  welcomeMessage: string;
  setWelcomeMessage: (v: string) => void;
  agentName: string;
}) {
  const pills: { id: Personality; label: string }[] = [
    { id: "amigable", label: "Amigable" },
    { id: "profesional", label: "Profesional" },
    { id: "divertida", label: "Divertida" },
    { id: "seria", label: "Seria" },
  ];
  return (
    <div className="mt-6 space-y-8">
      <div>
        <h3 className="font-syne text-[22px] font-bold tracking-[-0.02em] text-[var(--text-primary)]">¿Cómo se comporta?</h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Elegí el rol que mejor representa cómo querés conversar con visitantes.</p>
      </div>
      <div>
        <p className="mb-3 text-xs font-medium text-[var(--text-tertiary)]">Tipo de agente</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {AGENT_CARDS.map((c) => {
            const selected = agentType === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setAgentType(c.id)}
                className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-150 ${
                  selected
                    ? "border-[rgba(99,102,241,0.5)] bg-[rgba(99,102,241,0.08)]"
                    : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[var(--border-strong)]"
                } dash-focus-ring`}
              >
                {selected ? (
                  <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                ) : null}
                <span className="text-[28px]">{c.emoji}</span>
                <span className="font-syne text-sm font-semibold text-[var(--text-primary)]">{c.title}</span>
                <span className="text-xs text-[var(--text-tertiary)]">{c.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)]">¿Cómo habla tu agente?</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {pills.map((p) => {
            const on = personality === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersonality(p.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                  on
                    ? "border-[rgba(99,102,241,0.4)] bg-[rgba(99,102,241,0.15)] text-[#818cf8]"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                } dash-focus-ring`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Mensaje de bienvenida</label>
          <span className="text-[10px] text-[var(--text-tertiary)]">{welcomeMessage.length}/120</span>
        </div>
        <textarea
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value.slice(0, 120))}
          placeholder={`¡Hola! Soy ${agentName || "tu asistente"}. ¿En qué te puedo ayudar?`}
          rows={3}
          className="dash-focus-ring w-full resize-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] transition-colors duration-150 placeholder:text-[var(--text-tertiary)]"
        />
      </div>
    </div>
  );
}

function StepAvatarPick({
  primary,
  advanceCharPrimary,
  subtype,
  setSubtype,
  brandColor,
  setBrandColor,
  brandColor2,
  setBrandColor2,
  logoUrl,
  setLogoUrl,
  avatarMicro,
  genBusy,
  genMessage,
}: {
  primary: PrimaryChar | null;
  advanceCharPrimary: (p: PrimaryChar) => void;
  subtype: string;
  setSubtype: (v: string) => void;
  brandColor: string;
  setBrandColor: (v: string) => void;
  brandColor2: string;
  setBrandColor2: (v: string) => void;
  logoUrl: string | null;
  setLogoUrl: (v: string | null) => void;
  avatarMicro: "pick" | "generating" | "done";
  genBusy: boolean;
  genMessage: string;
}) {
  return (
    <div className="mt-6 space-y-8 pb-8 md:pb-0">
      <div>
        <h3 className="font-syne text-[22px] font-bold tracking-[-0.02em] text-[var(--text-primary)]">¿Cómo se ve tu agente?</h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Personaje, color de marca y logo opcional.</p>
      </div>

      {!primary ? (
        <div>
          <p className="mb-3 text-xs font-medium text-[var(--text-tertiary)]">Tipo de personaje</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(
              [
                ["human", "👤", "Humano"],
                ["perro", "🐶", "Perro"],
                ["gato", "🐱", "Gato"],
                ["fruta", "🍊", "Fruta"],
                ["objeto", "☕", "Objeto"],
                ["animal", "🦊", "Animal"],
              ] as const
            ).map(([id, emoji, label]) => (
              <SelectableTile
                key={id}
                selected={primary === id}
                onClick={() => advanceCharPrimary(id as PrimaryChar)}
                className="min-h-[100px] py-4"
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs font-medium text-[var(--text-primary)]">{label}</span>
              </SelectableTile>
            ))}
          </div>
        </div>
      ) : null}

      {primary === "human" ? (
        <div>
          <p className="mb-2 text-xs text-[var(--text-tertiary)]">Variante</p>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["male", "♂", "Hombre"],
                ["female", "♀", "Mujer"],
              ] as const
            ).map(([id, sym, label]) => (
              <SelectableTile
                key={id}
                selected={subtype === id}
                onClick={() => setSubtype(id)}
                className="min-h-[100px]"
              >
                <span className="text-2xl">{sym}</span>
                <span className="font-syne text-sm font-semibold">{label}</span>
              </SelectableTile>
            ))}
          </div>
        </div>
      ) : null}

      {primary === "fruta" ? (
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["naranja", "🍊", "Naranja"],
              ["manzana", "🍎", "Manzana"],
            ] as const
          ).map(([id, e, l]) => (
            <SelectableTile key={id} selected={subtype === id} onClick={() => setSubtype(id)} className="py-5">
              <span className="text-3xl">{e}</span>
              <span className="text-sm text-[var(--text-primary)]">{l}</span>
            </SelectableTile>
          ))}
        </div>
      ) : null}

      {primary === "objeto" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          {(
            [
              ["taza", "☕", "Taza"],
              ["estrella", "⭐", "Estrella"],
              ["cohete", "🚀", "Cohete"],
              ["diamante", "💎", "Diamante"],
            ] as const
          ).map(([id, e, l]) => (
            <SelectableTile key={id} selected={subtype === id} onClick={() => setSubtype(id)} className="py-4">
              <span className="text-2xl">{e}</span>
              <span className="text-sm text-[var(--text-primary)]">{l}</span>
            </SelectableTile>
          ))}
        </div>
      ) : null}

      {primary === "animal" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(
            [
              ["perro", "🐶", "Perro"],
              ["gato", "🐱", "Gato"],
              ["conejo", "🐰", "Conejo"],
              ["zorro", "🦊", "Zorro"],
              ["panda", "🐼", "Panda"],
              ["oso", "🐻", "Oso"],
            ] as const
          ).map(([id, e, l]) => (
            <SelectableTile key={id} selected={subtype === id} onClick={() => setSubtype(id)} className="py-3">
              <span className="text-xl sm:text-2xl">{e}</span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">{l}</span>
            </SelectableTile>
          ))}
        </div>
      ) : null}

      {primary &&
      (!needsSecondary(primary) || (needsSecondary(primary) && canProceedSecondary(primary, subtype))) ? (
        <>
          <div>
            <p className="mb-3 text-xs font-medium text-[var(--text-tertiary)]">Color principal de tu marca</p>
            <div className="flex flex-wrap gap-3">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  onClick={() => {
                    setBrandColor(c);
                    try {
                      setBrandColor2(Color(c).rotate(24).lighten(0.08).hex());
                    } catch {
                      setBrandColor2(c);
                    }
                  }}
                  className={`size-10 rounded-xl border-2 transition-transform duration-150 ${
                    brandColor === c ? "scale-110 border-white" : "border-transparent hover:scale-105"
                  } dash-focus-ring`}
                  style={{ backgroundColor: c, boxShadow: brandColor === c ? `0 0 0 2px ${c}66` : undefined }}
                />
              ))}
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[var(--border-default)] px-3 py-2 text-xs text-[var(--text-tertiary)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]">
                Personalizar
                <input
                  type="color"
                  value={brandColor}
                  className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent"
                  onChange={(e) => {
                    const v = e.target.value;
                    setBrandColor(v);
                    try {
                      setBrandColor2(Color(v).rotate(24).lighten(0.08).hex());
                    } catch {
                      /* keep */
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-[var(--text-tertiary)]">Logo (opcional)</p>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-8 text-center transition-all duration-150 hover:border-[var(--accent-border)] hover:bg-[var(--accent-subtle)]">
              <span className="text-sm text-[var(--text-secondary)]">Subir logo · o arrastrá acá</span>
              <span className="text-[11px] text-[var(--text-tertiary)]">PNG o SVG · fondo transparente</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = async () => {
                    const data = reader.result as string;
                    const r = await fetch("/api/onboarding/upload-logo", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ imageBase64: data }),
                    });
                    const j = (await r.json()) as { url?: string };
                    if (j.url) setLogoUrl(j.url);
                  };
                  reader.readAsDataURL(f);
                }}
              />
            </label>
            {logoUrl ? (
              <div className="mt-2 flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="" className="size-10 rounded-lg object-contain" />
                <Button type="button" variant="ghost" size="sm" onClick={() => setLogoUrl(null)}>
                  Quitar
                </Button>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {avatarMicro === "generating" ? (
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 md:hidden">
          <p className="text-sm font-medium text-[var(--text-primary)]">Generando avatar…</p>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">{genMessage}</p>
          {genBusy ? <Loader2 className="mt-4 size-6 animate-spin text-[var(--accent)]" /> : null}
        </div>
      ) : null}
    </div>
  );
}

function StepInstall({
  agentName,
  avatarUrl,
  genFallback,
  brandColor,
  url,
  createdSiteId,
  appUrl,
}: {
  agentName: string;
  avatarUrl: string | null;
  genFallback: boolean;
  brandColor: string;
  url: string;
  createdSiteId: string;
  appUrl: string;
}) {
  return (
    <div className="mt-6 space-y-8">
      <div>
        <h3 className="font-syne text-[22px] font-bold tracking-[-0.02em] text-[var(--text-primary)]">Tu agente está listo</h3>
        <div className="mt-6 flex items-center gap-4">
          <div
            className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl text-lg font-bold text-white"
            style={{ background: brandColor }}
          >
            {avatarUrl && !genFallback ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              agentName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-syne text-lg font-bold text-[var(--text-primary)]">{agentName}</p>
            <p className="text-xs text-[var(--text-tertiary)]">{url.replace(/^https?:\/\//, "")}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.12)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--success)]">
              <span className="size-1.5 animate-pulse rounded-full bg-[var(--success)]" />
              Activo
            </span>
          </div>
        </div>
      </div>
      <InstallSnippet siteId={createdSiteId} appUrl={appUrl} verify installCheckUrl={`/api/onboarding/verify/${createdSiteId}`} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="rounded-[10px] bg-[var(--accent)] hover:bg-[var(--accent-hover)]">
          <Link href={`/dashboard/${createdSiteId}`}>Ver mi dashboard</Link>
        </Button>
        <Button variant="secondary" asChild className="rounded-[10px]">
          <a href={url.startsWith("http") ? url : `https://${url}`} target="_blank" rel="noreferrer">
            Ir a mi web
          </a>
        </Button>
      </div>
    </div>
  );
}
