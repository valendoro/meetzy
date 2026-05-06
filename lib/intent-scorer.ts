/**
 * Intent scoring 0–100 + labels for Meetzy analytics.
 */

export type IntentLabel = "exploring" | "interested" | "evaluating" | "ready_to_buy" | "hot_lead";

export type SectionsViewed = Record<string, { time: number; revisits: number }>;

export interface VisitorContextLike {
  timeOnSite?: number;
  sectionsViewed?: SectionsViewed;
  scrollDepth?: number;
  isReturnVisitor?: boolean;
}

export interface IntentSignalEntry {
  id: string;
  points: number;
  label: string;
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

export function intentLabelFromScore(score: number): IntentLabel {
  if (score <= 20) return "exploring";
  if (score <= 40) return "interested";
  if (score <= 65) return "evaluating";
  if (score <= 85) return "ready_to_buy";
  return "hot_lead";
}

/** Behavior signals from tracking context (single pass, not cumulative per message). */
export function scoreFromBehavior(ctx: VisitorContextLike | undefined): { points: number; signals: IntentSignalEntry[] } {
  if (!ctx) return { points: 0, signals: [] };
  const signals: IntentSignalEntry[] = [];
  let points = 0;

  const sections = ctx.sectionsViewed ?? {};
  const pricing = sections["pricing"] ?? { time: 0, revisits: 0 };
  const t = pricing.time ?? 0;
  const rev = pricing.revisits ?? 0;

  if (t > 30) {
    signals.push({ id: "pricing_30s", points: 15, label: "Tiempo en pricing > 30s" });
    points += 15;
  }
  if (t > 60) {
    signals.push({ id: "pricing_60s", points: 10, label: "Tiempo en pricing > 60s" });
    points += 10;
  }
  if (rev >= 2) {
    signals.push({ id: "pricing_rev2", points: 10, label: "Revisitó pricing 2+ veces" });
    points += 10;
  }
  if (rev >= 3) {
    signals.push({ id: "pricing_rev3", points: 10, label: "Revisitó pricing 3+ veces" });
    points += 10;
  }

  const timeOnSite = ctx.timeOnSite ?? 0;
  if (timeOnSite > 180) {
    signals.push({ id: "time_3m", points: 10, label: "Más de 3 minutos en el sitio" });
    points += 10;
  }

  const sectionKeys = Object.keys(sections).length;
  if (sectionKeys > 3) {
    signals.push({ id: "sections_3", points: 5, label: "Visitó más de 3 secciones" });
    points += 5;
  }

  if (ctx.isReturnVisitor) {
    signals.push({ id: "return_visitor", points: 15, label: "Visitante recurrente" });
    points += 15;
  }

  const scroll = ctx.scrollDepth ?? 0;
  if (scroll > 70) {
    signals.push({ id: "scroll_70", points: 5, label: "Scroll > 70%" });
    points += 5;
  }

  return { points: Math.min(100, points), signals };
}

const CHAT_SIGNALS: { id: string; re: RegExp; points: number; label: string }[] = [
  { id: "price", re: /cuánto|precio|costo|sale|cobran|vale|pricing|plan\s+pro|cuanto/i, points: 20, label: "Preguntó por precio" },
  { id: "integration", re: /integra|api|webhook|zapier|make\.com|n8n|conectar con/i, points: 15, label: "Preguntó por integración" },
  { id: "business", re: /tengo (?:un|una)|mi (?:negocio|empresa|veterinaria|local)|trabajo en|soy de/i, points: 10, label: "Mencionó su negocio" },
  { id: "payment", re: /pago|tarjeta|transferencia|factura|contratar|suscribir|checkout|billing/i, points: 25, label: "Preguntó por proceso de pago" },
  { id: "compare", re: /vs\.?|versus|comparo|competidor|alternativa a|como (?:intercom|drift|tidio)/i, points: 20, label: "Comparó con competidor" },
  { id: "trial", re: /prueba|gratis|trial|descuent|promo/i, points: 20, label: "Preguntó por trial o descuento" },
  { id: "urgency", re: /hoy|esta semana|ya mismo|ahora|urgente|rápido|lo antes posible/i, points: 25, label: "Mencionó urgencia" },
];

export function scoreFromChatMessage(text: string): { points: number; signals: IntentSignalEntry[] } {
  const signals: IntentSignalEntry[] = [];
  let points = 0;
  const trimmed = text.trim();
  if (!trimmed) return { points: 0, signals };

  if (EMAIL_RE.test(trimmed)) {
    signals.push({ id: "email_shared", points: 30, label: "Compartió email" });
    points += 30;
  }

  const seen = new Set<string>();
  for (const s of CHAT_SIGNALS) {
    if (seen.has(s.id)) continue;
    if (s.re.test(trimmed)) {
      seen.add(s.id);
      signals.push({ id: s.id, points: s.points, label: s.label });
      points += s.points;
    }
  }

  return { points: Math.min(100, points), signals };
}

/** Merge behavior + sum of per-message chat scores (each user message scored once). */
export function mergeScores(behaviorPoints: number, chatPointsFromMessages: number): number {
  return Math.min(100, behaviorPoints + chatPointsFromMessages);
}

export function computeFullIntent(userMessages: string[], ctx: VisitorContextLike | undefined): {
  intentScore: number;
  intentLabel: IntentLabel;
  intentSignalsLog: IntentSignalEntry[];
} {
  const { points: bPts, signals: bSig } = scoreFromBehavior(ctx);
  let chatTotal = 0;
  const chatEntries: IntentSignalEntry[] = [];
  for (const msg of userMessages) {
    const { points, signals } = scoreFromChatMessage(msg);
    chatTotal += points;
    chatEntries.push(...signals);
  }
  chatTotal = Math.min(100, chatTotal);
  const merged = mergeScores(bPts, chatTotal);
  const combined: IntentSignalEntry[] = [...bSig, ...chatEntries];
  return {
    intentScore: merged,
    intentLabel: intentLabelFromScore(merged),
    intentSignalsLog: combined,
  };
}
