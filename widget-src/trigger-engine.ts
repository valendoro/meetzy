export interface VisitorContext {
  timeOnSite: number;
  currentSection: string;
  sectionsViewed: Record<string, { time: number; revisits: number }>;
  referrer: string;
  searchQuery: string | null;
  localHour: number;
  isReturnVisitor: boolean;
  inferredIntent: string;
  scrollDepth: number;
  mouseY: number;
}

export interface SectionTrigger {
  id: string;
  section: string;
  condition: (ctx: VisitorContext) => boolean;
  message: string | ((ctx: VisitorContext) => string);
  priority: number;
}

const SECTION_TRIGGERS: SectionTrigger[] = [
  // ── HERO ─────────────────────────────────────────────
  {
    id: "hero_idle",
    section: "hero",
    priority: 1,
    condition: (ctx) =>
      ctx.currentSection === "hero" &&
      (ctx.sectionsViewed["hero"]?.time ?? 0) >= 20,
    message: "¿Querés que te cuente en 30 segundos qué es Meetzy?",
  },

  // ── PROBLEMA ─────────────────────────────────────────
  {
    id: "problem_engage",
    section: "problem",
    priority: 2,
    condition: (ctx) =>
      ctx.currentSection === "problem" &&
      (ctx.sectionsViewed["problem"]?.time ?? 0) >= 30,
    message: "¿Alguno de estos casos se parece a tu negocio?",
  },

  // ── BEHAVIORAL TRACKING ───────────────────────────────
  {
    id: "features_data",
    section: "features",
    priority: 3,
    condition: (ctx) =>
      ctx.currentSection === "features" &&
      (ctx.sectionsViewed["features"]?.time ?? 0) >= 25,
    message: (ctx) =>
      `Esos datos que ves — son los tuyos reales en esta página. Llevás ${ctx.timeOnSite}s acá.`,
  },

  // ── CASOS DE USO ──────────────────────────────────────
  {
    id: "usecases_tabs",
    section: "use-cases",
    priority: 4,
    condition: (ctx) =>
      ctx.currentSection === "use-cases" &&
      (ctx.sectionsViewed["use-cases"]?.revisits ?? 0) >= 2,
    message:
      "¿Cuál es tu tipo de negocio? Te muestro cómo quedaría exactamente.",
  },
  {
    id: "usecases_idle",
    section: "use-cases",
    priority: 5,
    condition: (ctx) =>
      ctx.currentSection === "use-cases" &&
      (ctx.sectionsViewed["use-cases"]?.time ?? 0) >= 35 &&
      (ctx.sectionsViewed["use-cases"]?.revisits ?? 0) < 2,
    message: "¿En qué rubro estás? Te armo cómo quedaría tu agente.",
  },

  // ── AVATAR ────────────────────────────────────────────
  {
    id: "avatar_explore",
    section: "avatar",
    priority: 6,
    condition: (ctx) =>
      ctx.currentSection === "avatar" &&
      (ctx.sectionsViewed["avatar"]?.time ?? 0) >= 20,
    message:
      "¿Cuál de estos se parece más a lo que imaginás para tu marca?",
  },

  // ── CÓMO FUNCIONA ─────────────────────────────────────
  {
    id: "how_step3",
    section: "how",
    priority: 7,
    condition: (ctx) =>
      ctx.currentSection === "how" &&
      (ctx.sectionsViewed["how"]?.time ?? 0) >= 30,
    message:
      "¿Tenés web propia o usás Webflow, WordPress o Shopify?",
  },

  // ── PRECIOS — CRÍTICO ─────────────────────────────────
  {
    id: "pricing_first",
    section: "pricing",
    priority: 0, // highest
    condition: (ctx) =>
      ctx.currentSection === "pricing" &&
      (ctx.sectionsViewed["pricing"]?.time ?? 0) >= 30 &&
      (ctx.sectionsViewed["pricing"]?.revisits ?? 0) === 0,
    message:
      "¿Querés que te ayude a entender cuál plan tiene más sentido para lo que necesitás?",
  },
  {
    id: "pricing_long",
    section: "pricing",
    priority: 0,
    condition: (ctx) =>
      ctx.currentSection === "pricing" &&
      (ctx.sectionsViewed["pricing"]?.time ?? 0) >= 60,
    message:
      "Antes de que te vayas — tenés 14 días gratis para probarlo sin tarjeta.",
  },
  {
    id: "pricing_revisit",
    section: "pricing",
    priority: 0,
    condition: (ctx) =>
      ctx.currentSection === "pricing" &&
      (ctx.sectionsViewed["pricing"]?.revisits ?? 0) >= 2,
    message: "Volviste a los precios. ¿Qué te está frenando?",
  },

  // ── FAQ ───────────────────────────────────────────────
  {
    id: "faq_idle",
    section: "faq",
    priority: 8,
    condition: (ctx) =>
      (ctx.currentSection === "pricing" || ctx.currentSection === "faq") &&
      (ctx.sectionsViewed["pricing"]?.time ?? 0) >= 20 &&
      (ctx.sectionsViewed["faq"]?.time ?? 0) >= 20,
    message: "¿No encontraste lo que buscabas? Preguntame directamente.",
  },

  // ── GLOBALES ──────────────────────────────────────────
  {
    id: "return_visitor",
    section: "*",
    priority: -1, // highest of all
    condition: (ctx) => ctx.isReturnVisitor && ctx.timeOnSite < 15,
    message: "Bienvenido de vuelta. ¿Seguís evaluando o ya tenés más claro lo que necesitás?",
  },
  {
    id: "exit_intent",
    section: "*",
    priority: 1,
    condition: (ctx) =>
      ctx.mouseY < 60 &&
      ctx.timeOnSite > 30 &&
      ctx.currentSection === "pricing",
    message:
      "Antes de que te vayas — el plan Starter arranca en $29/mes y tiene 14 días gratis.",
  },
];

export const SECTION_CHIPS: Record<string, string[]> = {
  hero:       ["¿Cómo funciona exactamente?", "¿Para qué tipo de negocio?", "Ver los planes"],
  problem:    ["Tengo una veterinaria", "Tengo un ecommerce", "Tengo una consultora"],
  features:   ["¿Esto no es invasivo?", "¿Cómo lo instalo?", "Ver demo en vivo"],
  "use-cases":["Mi negocio es diferente", "¿Funciona para pymes?", "¿Cuánto cuesta?"],
  avatar:     ["¿Puedo poner mi logo?", "¿Qué es el Plan Pro?", "Ver todos los tipos"],
  how:        ["¿Tengo que saber programar?", "¿Cuánto tarda?", "Probarlo gratis"],
  pricing:    ["¿Qué incluye el Pro?", "¿Hay descuento anual?", "Empezar gratis"],
  faq:        ["¿Puedo cancelar cuando quiero?", "¿Funciona en mi web?", "Hablar con alguien"],
  demo:       ["¿Esto es el producto real?", "¿Cómo lo instalo yo?", "Empezar gratis"],
};

/** Chips de bienvenida según el tipo de agente configurado en el sitio */
export const AGENT_TYPE_CHIPS: Record<string, string[]> = {
  vendedor:       ["¿Cuánto cuesta?", "Quiero una demo", "¿Qué incluye el plan?"],
  guia:           ["¿Cómo funciona?", "¿Para quién es?", "Ver características"],
  soporte:        ["Tengo un problema", "¿Cómo lo resuelvo?", "Hablar con alguien"],
  recepcionista:  ["Quiero un turno", "Ver disponibilidad", "¿Cómo reservo?"],
};

export class TriggerEngine {
  private firedIds = new Set<string>();
  private lastTriggerAt = 0;
  private triggerCount = 0;
  private readonly MAX_TRIGGERS = 3;
  private readonly MIN_FIRST_TRIGGER_DELAY = 15000; // 15s
  private readonly COOLDOWN = 180000; // 3 min

  evaluate(ctx: VisitorContext): SectionTrigger | null {
    const now = Date.now();

    // Respect minimums
    if (now - window._mzWidgetInit < this.MIN_FIRST_TRIGGER_DELAY) return null;
    if (now - this.lastTriggerAt < this.COOLDOWN) return null;
    if (this.triggerCount >= this.MAX_TRIGGERS) return null;

    // Sort by priority (lower = higher priority)
    const sorted = [...SECTION_TRIGGERS].sort((a, b) => a.priority - b.priority);

    for (const trigger of sorted) {
      if (this.firedIds.has(trigger.id)) continue;
      if (trigger.section !== "*" && trigger.section !== ctx.currentSection) continue;
      if (!trigger.condition(ctx)) continue;

      this.firedIds.add(trigger.id);
      this.lastTriggerAt = now;
      this.triggerCount++;
      return trigger;
    }

    return null;
  }

  getMessage(trigger: SectionTrigger, ctx: VisitorContext): string {
    return typeof trigger.message === "function" ? trigger.message(ctx) : trigger.message;
  }

  getChips(section: string): string[] {
    return SECTION_CHIPS[section] ?? SECTION_CHIPS["hero"]!;
  }
}

declare global {
  interface Window { _mzWidgetInit: number; }
}
if (typeof window !== "undefined") {
  window._mzWidgetInit = window._mzWidgetInit ?? Date.now();
}
