"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import AvatarSvgPreview from "@/components/onboarding/AvatarSvgPreview";
import ConfettiCanvas from "@/components/onboarding/ConfettiCanvas";
import MiloCanvas from "@/components/onboarding/MiloCanvas";
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

export default function OnboardingExperience({ userPlan }: { userPlan: string }) {
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

  const archetype = useMemo(() => resolveArchetype(primary, subtype), [primary, subtype]);

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
      <header className="absolute left-0 right-0 top-0 z-[50] flex items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/dashboard" className="font-syne text-sm font-bold tracking-tight text-white/80 hover:text-white">
          ← Volver
        </Link>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/50">
          Plan <span className="text-white/90">{userPlan}</span>
        </span>
      </header>

      {phase === 1 && (
        <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-8 px-4 pb-24 pt-16 lg:flex-row lg:gap-0 lg:pb-12 lg:pt-20">
          {/* Preview sticky — mobile first */}
          <div
            className="order-1 flex min-h-[320px] flex-1 flex-col items-center justify-center px-4 py-10 lg:order-2 lg:sticky lg:top-0 lg:h-screen lg:w-[55%] lg:max-w-none"
            style={{
              background: `radial-gradient(ellipse at 50% 40%, ${brandColor}22 0%, transparent 65%)`,
            }}
          >
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
          </div>

          {/* Chat column */}
          <div className="order-2 flex w-full flex-1 flex-col gap-5 px-2 lg:order-1 lg:w-[45%] lg:max-w-xl lg:px-8">
            <div className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm">
              <MiloCanvas talking={step === "atype"} className="shrink-0 drop-shadow-[0_8px_24px_rgba(99,102,241,0.35)]" />
              <p className="min-w-0 flex-1 text-sm leading-relaxed text-white/90">{miloLine}</p>
            </div>

            {miloHelpReply ? (
              <p className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-3 py-2 text-xs text-indigo-100">{miloHelpReply}</p>
            ) : null}

            <div className="space-y-4 rounded-2xl border border-white/[0.06] bg-black/20 p-5">
              {step === "biz" && (
                <>
                  <Input
                    placeholder="Ej: Café del Sol"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/35"
                  />
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
                    <button
                      key={id}
                      type="button"
                      onClick={() => advanceCharPrimary(id as PrimaryChar)}
                      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all hover:-translate-y-1 hover:border-indigo-400/50 hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)] ${
                        primary === id ? "border-indigo-400 bg-indigo-500/15" : "border-white/10 bg-white/[0.04]"
                      }`}
                    >
                      <span className="text-3xl">{emoji}</span>
                      <span className="text-xs font-semibold text-white/90">{label}</span>
                    </button>
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
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSubtype(id);
                        afterSecondary();
                      }}
                      className="rounded-2xl border border-white/10 bg-white/[0.05] py-6 text-center hover:border-indigo-400/50"
                    >
                      <span className="text-2xl">{sym}</span>
                      <p className="mt-2 text-sm font-medium">{label}</p>
                    </button>
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
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSubtype(id);
                        afterSecondary();
                      }}
                      className="rounded-2xl border border-white/10 bg-white/[0.05] py-5 hover:border-indigo-400/50"
                    >
                      <span className="text-3xl">{e}</span>
                      <p className="mt-1 text-sm">{l}</p>
                    </button>
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
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSubtype(id);
                        afterSecondary();
                      }}
                      className="rounded-xl border border-white/10 bg-white/[0.05] py-4 text-sm hover:border-indigo-400/50"
                    >
                      <span className="text-2xl">{e}</span>
                      <p>{l}</p>
                    </button>
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
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSubtype(id);
                        afterSecondary();
                      }}
                      className="rounded-xl border border-white/10 bg-white/[0.05] py-3 text-sm hover:border-indigo-400/50"
                    >
                      <span className="text-xl">{e}</span>
                      <p>{l}</p>
                    </button>
                  ))}
                </div>
              )}

              {step === "color" && (
                <>
                  <div className="flex flex-wrap gap-2">
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
                        className={`size-10 rounded-full ring-2 ring-offset-2 ring-offset-[#060608] ${
                          brandColor === c ? "ring-indigo-400" : "ring-transparent"
                        }`}
                        style={{ background: c }}
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
                      className="h-11 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                    />
                    <Input
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="flex-1 border-white/10 bg-white/[0.06] font-mono text-sm text-white"
                    />
                  </div>
                  <Button
                    onClick={() => setStep("logo")}
                    className="w-full"
                    style={{ boxShadow: `0 0 32px ${brandColor}44` }}
                  >
                    Siguiente
                  </Button>
                </>
              )}

              {step === "logo" && (
                <>
                  <div className="flex flex-wrap gap-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm hover:border-indigo-400/40">
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
                  <Input
                    placeholder="Ej: Luna, Max, Coco, Sofía…"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="border-white/10 bg-white/[0.06] text-white"
                  />
                  <Button className="w-full" disabled={!agentName.trim()} onClick={() => setStep("url")}>
                    Siguiente
                  </Button>
                </>
              )}

              {step === "url" && (
                <>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      placeholder="https://tuempresa.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-1 border-white/10 bg-white/[0.06] text-white"
                    />
                    <Button type="button" variant="secondary" disabled={analyzeBusy} onClick={() => void runAnalyze()}>
                      {analyzeBusy ? <Loader2 className="animate-spin" /> : "Analizar"}
                    </Button>
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
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setAgentType(c.id)}
                        className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
                          agentType === c.id ? "border-indigo-400 bg-indigo-500/15" : "border-white/10 bg-white/[0.04]"
                        }`}
                      >
                        <span className="text-2xl">{c.emoji}</span>
                        <p className="mt-2 font-syne font-bold text-white">{c.title}</p>
                        <p className="mt-1 text-xs text-white/50">{c.desc}</p>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={!phase1Complete}
                    onClick={() => startPhase2()}
                    className="mz-ob-shimmer-cta relative w-full overflow-hidden rounded-2xl py-4 text-sm font-bold text-white shadow-[0_0_40px_rgba(99,102,241,0.35)] disabled:opacity-40"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Generar mi agente <Sparkles className="size-4" />
                    </span>
                  </button>
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

            <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">¿Duda rápida? Milo responde</p>
              <div className="flex gap-2">
                <Input
                  value={miloHelp}
                  onChange={(e) => setMiloHelp(e.target.value)}
                  placeholder="Preguntá lo que sea…"
                  className="border-white/10 bg-white/[0.06] text-xs text-white"
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
        <div className="flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-24">
          <div className="mb-10 max-w-md text-center">
            {!avatarUrl || genBusy ? (
              <>
                <div className="mx-auto mb-8 flex justify-center">
                  <div className="scale-125">
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
                <p className="mb-2 font-syne text-lg text-white">
                  {["Analizando tu marca…", "Diseñando tu personaje…", "Aplicando tu identidad…", "Dando vida al agente…"][genStep] ??
                    "Listo"}
                </p>
                <p className="text-sm text-white/50">{genMessage}</p>
                <div className="mx-auto mt-6 h-1 max-w-xs overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (genStep + 1) * 25)}%` }}
                  />
                </div>
                {genBusy ? <Loader2 className="mx-auto mt-6 size-8 animate-spin text-indigo-400" /> : null}
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
            <h1 className="font-syne text-3xl font-bold text-white">¡{agentName} está listo!</h1>
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
