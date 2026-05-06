"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface VisitorContext {
  timeOnSite: number;
  currentPage: string;
  pagesVisited: string[];
  sectionsViewed: Record<string, { time: number; revisits: number }>;
  hoveredElements: string[];
  scrollDepth: Record<string, number>;
  referrer: string;
  searchQuery: string | null;
  localHour: number;
  localDay: string;
  isReturnVisitor: boolean;
  device: "mobile" | "desktop";
  scrollSpeed: "fast" | "normal" | "slow";
  inferredIntent: string;
  triggeredMessages: string[];
}

export interface BehaviorTrigger {
  id: string;
  condition: (ctx: VisitorContext) => boolean;
  message: string | ((ctx: VisitorContext) => string);
  delay: number;
}

const TRIGGERS: BehaviorTrigger[] = [
  {
    id: "return_visitor",
    condition: (ctx) => ctx.isReturnVisitor && ctx.timeOnSite > 8,
    message: "Bienvenido de vuelta. ¿Seguís evaluando o ya tenés más claro lo que necesitás?",
    delay: 0,
  },
  {
    id: "pricing_long",
    condition: (ctx) =>
      (ctx.sectionsViewed["pricing"]?.time ?? 0) > 45 &&
      !ctx.triggeredMessages.includes("pricing_long"),
    message:
      "Vi que estuviste un rato mirando los planes. ¿Querés que te ayude a entender cuál tiene más sentido para tu negocio?",
    delay: 2000,
  },
  {
    id: "pricing_revisit",
    condition: (ctx) =>
      (ctx.sectionsViewed["pricing"]?.revisits ?? 0) >= 2 &&
      !ctx.triggeredMessages.includes("pricing_revisit"),
    message: "Volviste a los precios. ¿Hay algo que no quedó claro?",
    delay: 1000,
  },
  {
    id: "from_google",
    condition: (ctx) =>
      ctx.referrer.includes("google") &&
      ctx.timeOnSite > 20 &&
      !ctx.triggeredMessages.includes("from_google"),
    message: "Vi que llegaste buscando algo relacionado. ¿Es lo que estás viendo lo que buscabas?",
    delay: 3000,
  },
  {
    id: "long_session",
    condition: (ctx) =>
      ctx.timeOnSite > 150 &&
      !ctx.sectionsViewed["pricing"] &&
      !ctx.triggeredMessages.includes("long_session"),
    message: "Llevás un rato explorando. ¿Puedo ayudarte a encontrar algo específico?",
    delay: 2000,
  },
  {
    id: "ready_to_act",
    condition: (ctx) =>
      ctx.inferredIntent === "ready_to_act" &&
      !ctx.triggeredMessages.includes("ready_to_act"),
    message: "Parece que ya tenés bastante claro lo que querés. ¿Arrancamos?",
    delay: 1000,
  },
];

function inferIntent(ctx: VisitorContext): string {
  if (ctx.isReturnVisitor) return "returning_interested";
  if ((ctx.sectionsViewed["pricing"]?.revisits ?? 0) >= 2) return "ready_to_act";
  if ((ctx.sectionsViewed["pricing"]?.time ?? 0) > 45) return "evaluating_pricing";
  if ((ctx.sectionsViewed["features"]?.time ?? 0) > 60) return "evaluating_features";
  if (ctx.timeOnSite > 180) return "deeply_exploring";
  if (ctx.scrollSpeed === "fast") return "scanning";
  return "exploring";
}

function extractSearchQuery(referrer: string): string | null {
  try {
    const url = new URL(referrer);
    return (
      url.searchParams.get("q") ??
      url.searchParams.get("query") ??
      url.searchParams.get("search") ??
      null
    );
  } catch {
    return null;
  }
}

export function buildContextPrompt(ctx: VisitorContext): string {
  const days = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  return `CONTEXTO DEL VISITANTE EN TIEMPO REAL:
Tiempo en el sitio: ${ctx.timeOnSite}s
Página actual: ${ctx.currentPage}
Páginas visitadas: ${ctx.pagesVisited.join(" → ")}
Secciones y tiempo: ${JSON.stringify(ctx.sectionsViewed)}
Intención inferida: ${ctx.inferredIntent}
Origen: ${ctx.referrer || "directo"}
Búsqueda: ${ctx.searchQuery ?? "no disponible"}
Hora local: ${ctx.localHour}hs (${days[new Date().getDay()]})
Visita anterior: ${ctx.isReturnVisitor ? "sí" : "no"}
Device: ${ctx.device}
Velocidad de scroll: ${ctx.scrollSpeed}

INSTRUCCIONES CRÍTICAS:
- No preguntes lo que ya sabés del contexto
- Si evaluating_pricing → hablá de planes directamente
- Si son las 22-6hs → sé muy conciso (máximo 2 líneas)
- Si es return visitor → asumí que ya conoce el concepto
- Si vino de Google → no expliques qué es Meetzy desde cero
- Máximo 2-3 líneas por respuesta
- No uses markdown, texto plano
- Español rioplatense natural (vos, che)
- Sé como una persona real hablando, no un bot`;
}

export interface BehaviorTrackerResult {
  context: VisitorContext;
  triggerMessage: string | null;
  clearTrigger: () => void;
  mousePosition: { x: number; y: number };
}

export function useBehaviorTracker(): BehaviorTrackerResult {
  const startTime = useRef(Date.now());
  const ctxRef = useRef<VisitorContext>({
    timeOnSite: 0,
    currentPage: typeof window !== "undefined" ? window.location.pathname : "/",
    pagesVisited: [typeof window !== "undefined" ? window.location.pathname : "/"],
    sectionsViewed: {},
    hoveredElements: [],
    scrollDepth: {},
    referrer: typeof window !== "undefined" ? document.referrer : "",
    searchQuery: typeof window !== "undefined" ? extractSearchQuery(document.referrer) : null,
    localHour: new Date().getHours(),
    localDay: new Date().toLocaleDateString("es-AR", { weekday: "long" }),
    isReturnVisitor: typeof window !== "undefined" ? !!localStorage.getItem("mz_visited") : false,
    device: typeof window !== "undefined" ? (window.innerWidth < 768 ? "mobile" : "desktop") : "desktop",
    scrollSpeed: "normal",
    inferredIntent: "exploring",
    triggeredMessages: [],
  });

  const [triggerMessage, setTriggerMessage] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const triggeredRef = useRef<Set<string>>(new Set());
  const minTriggerTime = useRef(Date.now() + 15000); // 15s min before first trigger
  const activeSections = useRef<Map<string, number>>(new Map()); // id → timestamp when entered

  const clearTrigger = useCallback(() => setTriggerMessage(null), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("mz_visited", "true");

    // ── Time tracker ─────────────────────────────────────
    const timeInterval = setInterval(() => {
      ctxRef.current.timeOnSite = Math.round((Date.now() - startTime.current) / 1000);
      // Accumulate active section times
      activeSections.current.forEach((enterTime, id) => {
        const elapsed = Math.round((Date.now() - enterTime) / 1000);
        if (!ctxRef.current.sectionsViewed[id]) {
          ctxRef.current.sectionsViewed[id] = { time: 0, revisits: 0 };
        }
        ctxRef.current.sectionsViewed[id]!.time = elapsed;
      });
    }, 1000);

    // ── IntersectionObserver ──────────────────────────────
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          const id = el.dataset["section"] ?? el.id ?? "";
          if (!id) return;

          if (entry.isIntersecting) {
            if (activeSections.current.has(id)) {
              // Re-entry = revisit
              if (ctxRef.current.sectionsViewed[id]) {
                ctxRef.current.sectionsViewed[id]!.revisits++;
              }
            } else {
              if (!ctxRef.current.sectionsViewed[id]) {
                ctxRef.current.sectionsViewed[id] = { time: 0, revisits: 0 };
              }
            }
            activeSections.current.set(id, Date.now());
          } else {
            activeSections.current.delete(id);
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll("[data-section]").forEach((el) => observer.observe(el));

    // Observe new elements as they're added
    const mutObs = new MutationObserver((muts) => {
      muts.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            if (node.hasAttribute("data-section")) observer.observe(node);
            node.querySelectorAll("[data-section]").forEach((el) => observer.observe(el));
          }
        });
      });
    });
    mutObs.observe(document.body, { childList: true, subtree: true });

    // ── Scroll velocity ───────────────────────────────────
    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();
    const onScroll = () => {
      const now = Date.now();
      const delta = Math.abs(window.scrollY - lastScrollY);
      const elapsed = Math.max(now - lastScrollTime, 16);
      const velocity = delta / elapsed;
      ctxRef.current.scrollSpeed = velocity > 1.5 ? "fast" : velocity < 0.3 ? "slow" : "normal";
      ctxRef.current.scrollDepth[ctxRef.current.currentPage] = Math.round(
        (window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1)) * 100
      );
      lastScrollY = window.scrollY;
      lastScrollTime = now;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── Mouse position ────────────────────────────────────
    let mouseTick = 0;
    const onMouseMove = (e: MouseEvent) => {
      if (++mouseTick % 3 !== 0) return; // throttle
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // ── Page visibility ───────────────────────────────────
    const onVisibility = () => {
      if (document.hidden) {
        startTime.current = Date.now() - ctxRef.current.timeOnSite * 1000;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // ── Intent inference + trigger eval (every 2s) ────────
    const intentInterval = setInterval(() => {
      ctxRef.current.inferredIntent = inferIntent(ctxRef.current);

      if (Date.now() < minTriggerTime.current) return;
      if (triggerMessage) return; // already showing one

      for (const trigger of TRIGGERS) {
        if (triggeredRef.current.has(trigger.id)) continue;
        if (trigger.condition(ctxRef.current)) {
          triggeredRef.current.add(trigger.id);
          ctxRef.current.triggeredMessages.push(trigger.id);
          const msg =
            typeof trigger.message === "function"
              ? trigger.message(ctxRef.current)
              : trigger.message;
          setTimeout(() => setTriggerMessage(msg), trigger.delay);
          break;
        }
      }
    }, 2000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(intentInterval);
      observer.disconnect();
      mutObs.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    context: ctxRef.current,
    triggerMessage,
    clearTrigger,
    mousePosition,
  };
}
