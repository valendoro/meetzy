"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import AvatarSvgPreview from "@/components/onboarding/AvatarSvgPreview";
import ConfettiCanvas from "@/components/onboarding/ConfettiCanvas";
import MiloCanvas from "@/components/onboarding/MiloCanvas";
import OnboardingProgress, { onboardingProgressFraction } from "@/components/onboarding/OnboardingProgress";
import OnboardingStage from "@/components/onboarding/OnboardingStage";
import { SelectableTile } from "@/components/onboarding/SelectableTile";
import type { PrimaryChar } from "@/components/onboarding/resolve-archetype";
import { resolveArchetype } from "@/components/onboarding/resolve-archetype";
import InstallSnippet from "@/components/dashboard/InstallSnippet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AvatarArchetype } from "@/lib/avatar-prompt-builder";
import { useProductToast } from "@/components/providers/product-toast";
import Color from "color";

const LS_KEY = "meetzy-onboarding-v1";

type FlowStep =
  | "biz"
  | "char-primary"
  | "char-secondary"
  | "color"
  | "logo"
  | "agent"
  | "url"
  | "atype";

const SWATCHES = ["#6366f1", "#ec4899", "#f97316", "#22c55e", "#0ea5e9", "#eab308", "#a855f7", "#14b8a6"];

const AGENT_CARDS = [
  {
    id: "vendedor" as const,
    emoji: "🛍️",
    title: "Vendedor",
    desc: "Detecta interés y empuja a la acción.",
  },
  {
    id: "guia" as const,
    emoji: "🗺️",
    title: "Guía",
    desc: "Acompaña y explica mientras navegan.",
  },
  {
    id: "soporte" as const,
    emoji: "🛠️",
    title: "Soporte",
    desc: "Resuelve dudas técnicas y problemas.",
  },
  {
    id: "recepcionista" as const,
    emoji: "📅",
    title: "Recepcionista",
    desc: "Agenda turnos y deriva consultas.",
  },
];

const FUN_MESSAGES = [
  "Le estamos eligiendo el outfit…",
  "Practicando las expresiones…",
  "Ajustando los colores de tu marca…",
  "Ya casi está listo para conocerte…",
];

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

export default function OnboardingExperience({ userPlan, isGuest = false }: { userPlan: string; isGuest?: boolean }) {
  const { push } = useProductToast();
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [step, setStep] = useState<FlowStep>("biz");
  const [businessName, setBusinessName] = useState("");
  const [primary, setPrimary] = useState<PrimaryChar | null>(null);
  const [subtype, setSubtype] = useState("");
  const [brandColor, setBrandColor] = useState("#6366f1");
  const [brandColor2, setBrandColor2] = useState("#8b5cf6");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [agentName, setAgentName] = useState("");
  const [url, setUrl] = useState("");
  const [agentType, setAgentType] = useState<(typeof AGENT_CARDS)[number]["id"] | null>(null);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("es");
  const [analyzeBusy, setAnalyzeBusy] = useState(false);
  const [miloHelp, setMiloHelp] = useState("");
  const [miloHelpReply, setMiloHelpReply] = useState<string | null>(null);
  const [miloBusy, setMiloBusy] = useState(false);

  const [genStep, setGenStep] = useState(0);
  const [genMessage, setGenMessage] = useState(FUN_MESSAGES[0] ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [genFallback, setGenFallback] = useState(false);
  const [genBusy, setGenBusy] = useState(false);
  const [localRegen, setLocalRegen] = useState(0);
  const [createdSiteId, setCreatedSiteId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const genTimer = useRef<number | null>(null);
  const [miloMode, setMiloMode] = useState<"idle" | "speak">("speak");

  const archetype = useMemo(() => resolveArchetype(primary, subtype), [primary, subtype]);

  const progress = useMemo(() => onboardingProgressFraction(step, primary), [step, primary]);

  const agentTypeLabel = useMemo(() => {
    const c = AGENT_CARDS.find((x) => x.id === agentType);
    return c?.title ?? "Agente";
  }, [agentType]);

  const personalityAnim = useMemo(() => {
    if (agentType === "vendedor") return "mz-ob-talk";
    if (agentType === "guia") return "mz-ob-float";
    if (agentType === "soporte") return "mz-breathe";
    return "mz-ob-breathe";
  }, [agentType]);

  const persist = useCallback(() => {
    const payload = {
      phase,
      step,
      businessName,
      primary,
      subtype,
      brandColor,
      brandColor2,
      logoUrl,
      agentName,
      url,
      agentType,
      systemPrompt,
      detectedLanguage,
      avatarUrl,
      createdSiteId,
    };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }, [
    phase,
    step,
    businessName,
    primary,
    subtype,
    brandColor,
    brandColor2,
    logoUrl,
    agentName,
    url,
    agentType,
    systemPrompt,
    detectedLanguage,
    avatarUrl,
    createdSiteId,
  ]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const p = JSON.parse(raw) as Record<string, unknown>;
      if (typeof p.businessName === "string") setBusinessName(p.businessName);
      if (typeof p.brandColor === "string") setBrandColor(p.brandColor);
      if (typeof p.url === "string") setUrl(p.url);
      if (typeof p.agentName === "string") setAgentName(p.agentName);
      if (p.primary) setPrimary(p.primary as PrimaryChar);
      if (typeof p.subtype === "string") setSubtype(p.subtype);
      if (typeof p.logoUrl === "string" || p.logoUrl === null) setLogoUrl(p.logoUrl as string | null);
      if (p.agentType) setAgentType(p.agentType as (typeof AGENT_CARDS)[number]["id"]);
      if (typeof p.systemPrompt === "string") setSystemPrompt(p.systemPrompt);
      if (typeof p.detectedLanguage === "string") setDetectedLanguage(p.detectedLanguage);
      if (typeof p.avatarUrl === "string") setAvatarUrl(p.avatarUrl);
      if (typeof p.createdSiteId === "string") setCreatedSiteId(p.createdSiteId);
      if (p.phase === 1 || p.phase === 2 || p.phase === 3) setPhase(p.phase);
      if (p.step) setStep(p.step as FlowStep);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    persist();
  }, [persist]);

  useEffect(() => {
    setMiloMode("speak");
    const t = window.setTimeout(() => setMiloMode("idle"), 1100);
    return () => clearTimeout(t);
  }, [step]);

  const miloLine = useMemo(() => {
    switch (step) {
      case "biz":
        return `¡Hola! Soy Milo, tu guía en Meetzy. Vamos a crear el agente de tu marca en menos de 5 minutos. ¿Cómo se llama tu negocio?`;
      case "char-primary":
        return `Perfecto. Ahora lo más importante — ¿qué tipo de personaje va a representar a ${businessName || "tu marca"}?`;
      case "char-secondary":
        if (primary === "human") return "¿Hombre o mujer?";
        if (primary === "fruta") return "¿Cuál encaja mejor con tu negocio?";
        if (primary === "objeto") return "¿Qué objeto representa mejor tu marca?";
        return "¿Cuál de estos animales te representa?";
      case "color":
        return "¿Cuál es el color principal de tu marca? Lo uso en la ropa o cuerpo del personaje.";
      case "logo":
        return "¿Tenés el logo de tu marca? Lo puedo mostrar en el personaje.";
      case "agent":
        return "¿Cómo se va a llamar tu agente? Podés inventar un nombre o usar el de tu marca.";
      case "url":
        return "Último paso antes de generar — ¿cuál es la URL de tu sitio? La analizo para que tu agente conozca tu negocio.";
      case "atype":
        return "¿Cómo querés que se comporte tu agente con los visitantes?";
      default:
        return "";
    }
  }, [step, businessName, primary]);

  const previewStage = useMemo(() => {
    if (phase >= 2 && avatarUrl && !genFallback) return "image" as const;
    if (primary && archetype) return "svg" as const;
    return "placeholder" as const;
  }, [phase, avatarUrl, genFallback, primary, archetype]);

  function advanceCharPrimary(p: PrimaryChar) {
    setPrimary(p);
    setSubtype("");
    if (p === "human" || p === "fruta" || p === "objeto" || p === "animal") {
      setStep("char-secondary");
    } else {
      setSubtype(p === "perro" ? "perro" : "gato");
      setStep("color");
    }
  }

  function afterSecondary() {
    setStep("color");
  }

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
    try {
      const r = await fetch("/api/onboarding/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });
      const j = (await r.json()) as { systemPrompt?: string; detectedLanguage?: string; error?: string };
      if (!r.ok) {
        push(j.error ?? "No se pudo analizar", "warning");
        return;
      }
      if (j.systemPrompt) setSystemPrompt(j.systemPrompt);
      if (j.detectedLanguage) setDetectedLanguage(j.detectedLanguage);
      push("Sitio analizado ✓", "success");
    } catch {
      push("Error de red al analizar", "error");
    } finally {
      setAnalyzeBusy(false);
    }
  }

  async function submitMiloHelp() {
    if (!miloHelp.trim()) return;
    setMiloBusy(true);
    setMiloHelpReply(null);
    try {
      const r = await fetch("/api/onboarding/milo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: miloHelp.trim() }],
          currentStep: step,
          contextHint: JSON.stringify({ businessName, primary, step }),
        }),
      });
      const j = (await r.json()) as { reply?: string };
      setMiloHelpReply(j.reply ?? "");
      setMiloHelp("");
    } finally {
      setMiloBusy(false);
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

  function startPhase2() {
    if (!archetype || !agentType || !businessName.trim() || !agentName.trim() || !url.trim()) {
      push("Completá todos los pasos antes de generar.", "warning");
      return;
    }
    if (isGuest) {
      // State is already persisted in localStorage via persist() — just redirect to sign-up
      persist();
      window.location.href = `/sign-up?redirect_url=${encodeURIComponent("/dashboard/new")}`;
      return;
    }
    if (!systemPrompt.trim()) void runAnalyze();
    setPhase(2);
    setGenStep(0);
    let i = 0;
    genTimer.current = window.setInterval(() => {
      i = (i + 1) % 4;
      setGenStep(i);
      setGenMessage(FUN_MESSAGES[i % FUN_MESSAGES.length] ?? "");
    }, 3200);
    void (async () => {
      try {
        await runGeneration(localRegen);
      } finally {
        if (genTimer.current) {
          clearInterval(genTimer.current);
          genTimer.current = null;
        }
        setGenStep(4);
      }
    })();
  }

  useEffect(() => {
    return () => {
      if (genTimer.current) clearInterval(genTimer.current);
    };
  }, []);

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
        archetype,
        agentType,
        systemPrompt: systemPrompt.trim() || "Sos un asistente amable de la marca.",
        detectedLanguage,
        embedMode: "widget",
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
    setPhase(3);
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
  }

  const phase1Complete =
    Boolean(
      businessName.trim() &&
        primary &&
        (needsSecondary(primary) ? canProceedSecondary(primary, subtype) : true) &&
        brandColor &&
        agentName.trim() &&
        url.trim() &&
        agentType,
    );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.meetzy.ai";

  return (
    <div className="meetzy-onboarding-root relative overflow-x-hidden">
      <ConfettiCanvas active={celebrate} />
      {phase === 1 ? <OnboardingProgress step={step} primary={primary} brandColor={brandColor} /> : null}

      <header className="absolute left-0 right-0 top-0 z-[50] flex flex-col gap-2.5 px-4 pb-3 pt-4 sm:px-8"
        style={{ background: "linear-gradient(to bottom, rgba(8,7,14,0.92) 0%, transparent 100%)", backdropFilter: "blur(8px)" }}
      >
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="ob-link-onb text-sm font-semibold">
            ← Volver
          </Link>
          <div className="flex items-center gap-2">
            {phase === 1 ? (
              <span className="ob-chip rounded-full px-3 py-1 font-syne text-[10px] font-bold uppercase tracking-[0.1em] text-white/60">
                Paso {progress.current} de {progress.total}
              </span>
            ) : null}
            <span className="ob-chip rounded-full px-3.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/55">
              Plan <span className="font-syne font-extrabold text-white/95">{userPlan}</span>
            </span>
          </div>
        </div>
        {phase === 1 ? (
          <div className="ob-bar-wrap w-full">
            <div className="ob-bar-fill" style={{ width: `${progress.pct}%` }} />
          </div>
        ) : null}
      </header>

      {phase === 1 && (
        <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-8 px-4 pb-24 pt-[5.5rem] lg:flex-row lg:gap-6 lg:pb-12 lg:px-8 lg:pt-24">
          <div className="order-1 lg:order-2 lg:sticky lg:top-0 lg:h-screen lg:flex-1">
            <OnboardingStage brandColor={brandColor}>
              <AvatarSvgPreview
                stage={previewStage}
                archetype={archetype}
                brandColor={brandColor}
                businessName={businessName}
                agentName={agentName || "Tu agente"}
                agentTypeLabel={agentTypeLabel}
                logoUrl={logoUrl}
                imageUrl={avatarUrl}
                personalityClass={personalityAnim}
              />
            </OnboardingStage>
          </div>

          <div className="order-2 flex w-full flex-1 flex-col gap-5 lg:order-1 lg:max-w-[560px]">
            <div
              className="ob-glass flex items-start gap-4 rounded-2xl p-5"
              style={{
                ["--ob-milo-brand" as string]: brandColor,
                borderLeftColor: `${brandColor}40`,
                borderLeftWidth: "2px",
              }}
            >
              <MiloCanvas mode={miloMode} brandTint={brandColor} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-syne text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/40">Milo · tu guía</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-white/90">{miloLine}</p>
              </div>
            </div>

            {miloHelpReply ? (
              <p className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-3 py-2 text-xs text-indigo-100">{miloHelpReply}</p>
            ) : null}

            <div className="ob-glass space-y-4 rounded-2xl p-5 sm:p-6">
              {step === "biz" && (
                <>
                  <div>
                    <p className="mb-1 font-syne text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Nombre del negocio</p>
                    <Input
                      placeholder="Ej: Café del Sol"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="border-white/[0.15] bg-white/[0.09] text-white placeholder:text-white/30 focus:border-indigo-500/60 focus:bg-white/[0.12]"
                    />
                  </div>
                  <Button className="w-full" disabled={!businessName.trim()} onClick={() => setStep("char-primary")}>
                    Siguiente <ArrowRight className="size-4" />
                  </Button>
                </>
              )}

              {step === "char-primary" && (
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
                      className="min-h-[108px] py-5"
                    >
                      <span className="text-3xl transition-transform duration-300 group-hover:scale-110">{emoji}</span>
                    <span className="font-syne text-[11px] font-semibold text-white/80">{label}</span>
                    </SelectableTile>
                  ))}
                </div>
              )}

              {step === "char-secondary" && primary === "human" && (
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
                      onClick={() => {
                        setSubtype(id);
                        afterSecondary();
                      }}
                      className="min-h-[120px] py-6"
                    >
                      <span className="text-3xl text-white/90">{sym}</span>
                      <span className="font-syne text-sm font-bold">{label}</span>
                    </SelectableTile>
                  ))}
                </div>
              )}

              {step === "char-secondary" && primary === "fruta" && (
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      ["naranja", "🍊", "Naranja"],
                      ["manzana", "🍎", "Manzana"],
                    ] as const
                  ).map(([id, e, l]) => (
                    <SelectableTile
                      key={id}
                      selected={subtype === id}
                      onClick={() => {
                        setSubtype(id);
                        afterSecondary();
                      }}
                      className="py-6"
                    >
                      <span className="text-4xl">{e}</span>
                      <span className="font-medium text-white/85">{l}</span>
                    </SelectableTile>
                  ))}
                </div>
              )}

              {step === "char-secondary" && primary === "objeto" && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                  {(
                    [
                      ["taza", "☕", "Taza"],
                      ["estrella", "⭐", "Estrella"],
                      ["cohete", "🚀", "Cohete"],
                      ["diamante", "💎", "Diamante"],
                    ] as const
                  ).map(([id, e, l]) => (
                    <SelectableTile
                      key={id}
                      selected={subtype === id}
                      onClick={() => {
                        setSubtype(id);
                        afterSecondary();
                      }}
                      className="py-4"
                    >
                      <span className="text-2xl">{e}</span>
                      <span className="text-sm text-white/85">{l}</span>
                    </SelectableTile>
                  ))}
                </div>
              )}

              {step === "char-secondary" && primary === "animal" && (
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
                    <SelectableTile
                      key={id}
                      selected={subtype === id}
                      onClick={() => {
                        setSubtype(id);
                        afterSecondary();
                      }}
                      className="py-3"
                    >
                      <span className="text-xl sm:text-2xl">{e}</span>
                      <span className="text-xs font-semibold text-white/85">{l}</span>
                    </SelectableTile>
                  ))}
                </div>
              )}

              {step === "color" && (
                <>
                  <p className="font-syne text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Color de tu marca</p>
                  <div className="flex flex-wrap gap-3">
                    {SWATCHES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setBrandColor(c);
                          try {
                            setBrandColor2(Color(c).rotate(24).lighten(0.08).hex());
                          } catch {
                            setBrandColor2(c);
                          }
                        }}
                        className={`size-11 rounded-xl transition-all duration-200 ring-2 ring-offset-2 ring-offset-[#14131e] ${
                          brandColor === c ? "ring-white scale-110" : "ring-transparent hover:scale-105"
                        }`}
                        style={{ background: c, boxShadow: brandColor === c ? `0 4px 16px ${c}70` : "none" }}
                        aria-label={c}
                      />
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => {
                        const v = e.target.value;
                        setBrandColor(v);
                        try {
                          setBrandColor2(Color(v).rotate(24).lighten(0.08).hex());
                        } catch {
                          /* keep */
                        }
                      }}
                      className="h-11 w-14 cursor-pointer rounded-xl border border-white/15 bg-transparent"
                    />
                    <Input
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="flex-1 border-white/[0.15] bg-white/[0.09] font-mono text-sm text-white"
                    />
                  </div>
                  <Button
                    onClick={() => setStep("logo")}
                    className="w-full"
                    style={{ boxShadow: `0 4px 24px ${brandColor}50` }}
                  >
                    Siguiente
                  </Button>
                </>
              )}

              {step === "logo" && (
                <>
                  <p className="font-syne text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Logo (opcional)</p>
                  <div className="flex flex-wrap gap-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.15] bg-white/[0.09] px-4 py-3 text-sm text-white/80 transition-colors hover:border-indigo-400/50 hover:bg-white/[0.12]">
                      <span>📁 Subir logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
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
                    <Button variant="secondary" type="button" onClick={() => { setLogoUrl(null); setStep("agent"); }}>
                      Saltar por ahora
                    </Button>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => setStep("agent")}
                  >
                    Continuar
                  </Button>
                </>
              )}

              {step === "agent" && (
                <>
                  <div>
                    <p className="mb-1 font-syne text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Nombre del agente</p>
                    <Input
                      placeholder="Ej: Luna, Max, Coco, Sofía…"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      className="border-white/[0.15] bg-white/[0.09] text-white placeholder:text-white/30 focus:border-indigo-500/60"
                    />
                  </div>
                  <Button className="w-full" disabled={!agentName.trim()} onClick={() => setStep("url")}>
                    Siguiente
                  </Button>
                </>
              )}

              {step === "url" && (
                <>
                  <div>
                    <p className="mb-1 font-syne text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">URL de tu web</p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        placeholder="https://tuempresa.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="flex-1 border-white/[0.15] bg-white/[0.09] text-white placeholder:text-white/30 focus:border-indigo-500/60"
                      />
                      <Button type="button" variant="secondary" disabled={analyzeBusy} onClick={() => void runAnalyze()}>
                        {analyzeBusy ? <Loader2 className="animate-spin" /> : "Analizar"}
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full" disabled={!url.trim()} onClick={() => setStep("atype")}>
                    Siguiente
                  </Button>
                </>
              )}

              {step === "atype" && (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {AGENT_CARDS.map((c) => (
                      <SelectableTile
                        key={c.id}
                        selected={agentType === c.id}
                        onClick={() => setAgentType(c.id)}
                        className="items-start p-5 text-left"
                      >
                        <span className="text-2xl">{c.emoji}</span>
                        <p className="font-syne text-base font-extrabold text-white">{c.title}</p>
                        <p className="text-xs leading-snug text-white/50">{c.desc}</p>
                      </SelectableTile>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={!phase1Complete}
                    onClick={() => startPhase2()}
                    className="ob-cta-generate relative mt-3 w-full overflow-hidden py-4 text-white disabled:opacity-40"
                  >
                    <span className="relative z-[1] flex items-center justify-center gap-2">
                      {isGuest ? "Crear cuenta y generar" : "Generar mi agente"} <Sparkles className="size-4 opacity-90" />
                    </span>
                  </button>
                  {isGuest && (
                    <p className="mt-2 text-center text-[11px] text-white/35">
                      Gratis · Sin tarjeta · 30 segundos
                    </p>
                  )}
                </>
              )}

              {step !== "biz" && phase === 1 ? (
                <button
                  type="button"
                  className="text-xs text-white/40 underline"
                  onClick={() => {
                    const order: FlowStep[] = [
                      "biz",
                      "char-primary",
                      "char-secondary",
                      "color",
                      "logo",
                      "agent",
                      "url",
                      "atype",
                    ];
                    const i = order.indexOf(step);
                    if (i > 0) {
                      const prev = order[i - 1]!;
                      if (prev === "char-secondary" && !needsSecondary(primary)) setStep("char-primary");
                      else setStep(prev);
                    }
                  }}
                >
                  ← Paso anterior
                </button>
              ) : null}
            </div>

            <div className="ob-glass rounded-xl p-4">
              <p className="mb-2 font-syne text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/40">¿Duda rápida?</p>
              <div className="flex gap-2">
                <Input
                  value={miloHelp}
                  onChange={(e) => setMiloHelp(e.target.value)}
                  placeholder="Preguntá lo que sea…"
                  className="border-white/[0.15] bg-white/[0.09] text-xs text-white placeholder:text-white/30"
                  onKeyDown={(e) => e.key === "Enter" && void submitMiloHelp()}
                />
                <Button type="button" size="sm" variant="secondary" disabled={miloBusy} onClick={() => void submitMiloHelp()}>
                  {miloBusy ? <Loader2 className="size-4 animate-spin" /> : "Enviar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 2 && (
        <div className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-28 lg:pt-24">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div
              className="absolute left-1/2 top-[36%] h-[min(90vw,540px)] w-[min(90vw,540px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
              style={{ background: `radial-gradient(circle, ${brandColor}33 0%, transparent 70%)` }}
            />
          </div>
          <div className="relative z-[1] mb-10 max-w-md text-center">
            {!avatarUrl || genBusy ? (
              <>
                <div className="relative mx-auto mb-10 flex h-[220px] w-[220px] items-center justify-center sm:h-[260px] sm:w-[260px]">
                  <div className="ob-gen-ring pointer-events-none rounded-full" aria-hidden />
                  <div className="ob-gen-ring pointer-events-none rounded-full" aria-hidden />
                  <div className="relative z-[2] scale-110 sm:scale-125">
                    <AvatarSvgPreview
                      stage="svg"
                      archetype={archetype}
                      brandColor={brandColor}
                      businessName={businessName}
                      agentName={agentName}
                      agentTypeLabel={agentTypeLabel}
                      logoUrl={logoUrl}
                      imageUrl={null}
                    />
                  </div>
                </div>
                <p className="mb-2 font-syne text-xl font-extrabold text-white md:text-2xl">
                  {["Analizando tu marca…", "Diseñando tu personaje…", "Aplicando tu identidad…", "Dando vida al agente…"][genStep] ??
                    "Listo"}
                </p>
                <p className="text-sm text-white/50">{genMessage}</p>
                <div className="ob-bar-wrap mx-auto mt-8 max-w-sm">
                  <div
                    className="ob-bar-fill h-full"
                    style={{ width: `${Math.min(100, (genStep + 1) * 25)}%` }}
                  />
                </div>
                {genBusy ? <Loader2 className="mx-auto mt-8 size-8 animate-spin text-[var(--accent)]" /> : null}
              </>
            ) : (
              <>
                <div className="mx-auto mb-8 max-w-[280px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl}
                    alt=""
                    className={`mx-auto max-h-[320px] rounded-3xl object-cover ring-2 ring-indigo-500/30 ${genFallback ? "" : "mz-ob-scan"}`}
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button className="gap-2" onClick={() => void finalizeSite()}>
                    ¡Me encanta! Continuar <ArrowRight className="size-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={localRegen >= 3}
                    onClick={() => {
                      const next = localRegen + 1;
                      setLocalRegen(next);
                      void runGeneration(next, { soft: true });
                    }}
                  >
                    Regenerar {localRegen >= 3 ? "(límite)" : ""}
                  </Button>
                  <Button variant="ghost" className="text-white/70" onClick={() => { setPhase(1); setStep("char-primary"); }}>
                    Ajustar
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {phase === 3 && createdSiteId && (
        <div className="mx-auto max-w-2xl px-4 pb-32 pt-28">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex justify-center">
              {avatarUrl && !genFallback ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="mz-ob-breathe size-32 rounded-3xl object-cover ring-2 ring-white/10 sm:size-40" />
              ) : null}
            </div>
            <h1 className="ob-title-gradient font-syne text-3xl font-extrabold md:text-4xl">¡{agentName} está listo!</h1>
            <p className="mt-2 text-white/55">Copiá el código en tu web. Verificamos la instalación automáticamente.</p>
          </div>

          <div className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl">
            <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-3 py-2">
              <span className="size-2.5 rounded-full bg-red-500/80" />
              <span className="size-2.5 rounded-full bg-amber-500/80" />
              <span className="size-2.5 rounded-full bg-green-500/80" />
              <span className="ml-3 truncate text-xs text-white/40">{url.replace(/^https?:\/\//, "")}</span>
            </div>
            <div className="relative h-40 bg-gradient-to-b from-white/[0.04] to-black/40 p-6">
              <p className="text-xs text-white/35">Preview del sitio</p>
              <div
                className="absolute bottom-4 right-4 flex size-14 items-center justify-center overflow-hidden rounded-full shadow-xl ring-2 ring-indigo-500/40"
                style={{ background: brandColor }}
              >
                {avatarUrl && !genFallback ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="size-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-white">{agentName.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>

          <InstallSnippet
            siteId={createdSiteId}
            appUrl={appUrl}
            verify
            installCheckUrl={`/api/onboarding/verify/${createdSiteId}`}
          />

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href={`/dashboard/${createdSiteId}`}>Ver mi dashboard</Link>
            </Button>
            <Button variant="secondary" asChild size="lg">
              <a href={url.startsWith("http") ? url : `https://${url}`} target="_blank" rel="noreferrer">
                Ir a mi web
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
