/**
 * Central config per agent type.
 * Drives: dashboard KPIs, labels, terminology, analytics focus, quick actions.
 */

export type AgentType = "vendedor" | "guia" | "soporte" | "recepcionista";

export interface AgentTypeConfig {
  label: string;
  icon: string;
  /** Short description for overview page */
  description: string;
  /** Color accent for type badge (tailwind safe-listed or CSS var) */
  accentClass: string;
  bgClass: string;
  /** KPI cards shown in the overview */
  kpis: {
    primary: { label: string; metricKey: "hotLeads" | "sessions" | "conversations" | "avgDuration" };
    secondary: { label: string; metricKey: "hotLeads" | "sessions" | "conversations" | "avgDuration" };
  };
  /** Relabeled intent stages for this type */
  intentLabels: Record<string, string>;
  /** Quick action links shown in overview */
  quickActions: { label: string; href: (siteId: string) => string; icon: string }[];
  /** Analytics page focus subtitle */
  analyticsSubtitle: string;
  /** Conversations page label */
  conversationsLabel: string;
  /** Visitors page label */
  visitorsLabel: string;
  /** What "conversion" means for this type */
  conversionLabel: string;
  /** Top insight label in analytics */
  topInsightLabel: string;
}

export const AGENT_TYPE_CONFIG: Record<AgentType, AgentTypeConfig> = {
  vendedor: {
    label: "Vendedor",
    icon: "💼",
    description: "Pipeline de ventas, hot leads y conversiones.",
    accentClass: "text-[#f87171]",
    bgClass: "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)]",
    kpis: {
      primary: { label: "Hot leads", metricKey: "hotLeads" },
      secondary: { label: "Sesiones · 7d", metricKey: "sessions" },
    },
    intentLabels: {
      exploring: "Mirando",
      interested: "Interesado",
      evaluating: "Evaluando",
      ready_to_buy: "Listo para cerrar",
      hot_lead: "🔥 Hot lead",
    },
    quickActions: [
      { label: "Ver pipeline", href: (id) => `/dashboard/${id}/visitors?intent=hot_lead`, icon: "🔥" },
      { label: "Conversaciones", href: (id) => `/dashboard/${id}/conversations`, icon: "💬" },
      { label: "Analítica", href: (id) => `/dashboard/${id}/analytics`, icon: "📊" },
    ],
    analyticsSubtitle: "Embudo de ventas, fuentes de tráfico y calidad de leads.",
    conversationsLabel: "Conversaciones de venta",
    visitorsLabel: "Prospectos",
    conversionLabel: "Hot leads",
    topInsightLabel: "Preguntas de compra frecuentes",
  },

  guia: {
    label: "Guía",
    icon: "🧭",
    description: "Engagement, preguntas frecuentes y exploración del sitio.",
    accentClass: "text-[#60a5fa]",
    bgClass: "bg-[rgba(59,130,246,0.08)] border-[rgba(59,130,246,0.2)]",
    kpis: {
      primary: { label: "Sesiones · 7d", metricKey: "sessions" },
      secondary: { label: "Tiempo promedio", metricKey: "avgDuration" },
    },
    intentLabels: {
      exploring: "Explorando",
      interested: "Interesado",
      evaluating: "Profundizando",
      ready_to_buy: "Listo para actuar",
      hot_lead: "⭐ Muy interesado",
    },
    quickActions: [
      { label: "Preguntas frecuentes", href: (id) => `/dashboard/${id}/analytics`, icon: "❓" },
      { label: "Conversaciones", href: (id) => `/dashboard/${id}/conversations`, icon: "💬" },
      { label: "Configurar guía", href: (id) => `/dashboard/${id}/settings`, icon: "⚙️" },
    ],
    analyticsSubtitle: "Engagement, secciones más visitadas y preguntas recurrentes.",
    conversationsLabel: "Consultas",
    visitorsLabel: "Visitantes",
    conversionLabel: "Muy interesados",
    topInsightLabel: "Lo que más preguntan",
  },

  soporte: {
    label: "Soporte",
    icon: "🛠️",
    description: "Consultas técnicas, resolución de problemas y satisfacción.",
    accentClass: "text-[#34d399]",
    bgClass: "bg-[rgba(52,211,153,0.08)] border-[rgba(52,211,153,0.2)]",
    kpis: {
      primary: { label: "Consultas · 7d", metricKey: "sessions" },
      secondary: { label: "Duración media", metricKey: "avgDuration" },
    },
    intentLabels: {
      exploring: "Revisando",
      interested: "Con duda",
      evaluating: "Problema activo",
      ready_to_buy: "Resuelto",
      hot_lead: "🚨 Urgente",
    },
    quickActions: [
      { label: "Ver urgentes", href: (id) => `/dashboard/${id}/visitors?intent=hot_lead`, icon: "🚨" },
      { label: "Historial", href: (id) => `/dashboard/${id}/conversations`, icon: "📋" },
      { label: "FAQs detectadas", href: (id) => `/dashboard/${id}/analytics`, icon: "📊" },
    ],
    analyticsSubtitle: "Issues recurrentes, tiempo de resolución y picos de consultas.",
    conversationsLabel: "Tickets",
    visitorsLabel: "Usuarios",
    conversionLabel: "Urgentes",
    topInsightLabel: "Problemas más reportados",
  },

  recepcionista: {
    label: "Recepcionista",
    icon: "📅",
    description: "Gestión de turnos, disponibilidad y agenda.",
    accentClass: "text-[#a78bfa]",
    bgClass: "bg-[rgba(167,139,250,0.08)] border-[rgba(167,139,250,0.2)]",
    kpis: {
      primary: { label: "Consultas · 7d", metricKey: "sessions" },
      secondary: { label: "Consultas de turno", metricKey: "conversations" },
    },
    intentLabels: {
      exploring: "Consultando",
      interested: "Quiere turno",
      evaluating: "Eligiendo horario",
      ready_to_buy: "Listo para reservar",
      hot_lead: "📅 Turno urgente",
    },
    quickActions: [
      { label: "Solicitudes de turno", href: (id) => `/dashboard/${id}/visitors?intent=ready_to_buy`, icon: "📅" },
      { label: "Conversaciones", href: (id) => `/dashboard/${id}/conversations`, icon: "💬" },
      { label: "Horarios pico", href: (id) => `/dashboard/${id}/analytics`, icon: "⏰" },
    ],
    analyticsSubtitle: "Horarios más solicitados, picos de demanda y conversión a turno.",
    conversationsLabel: "Solicitudes",
    visitorsLabel: "Pacientes / Clientes",
    conversionLabel: "Listos para reservar",
    topInsightLabel: "Servicios más consultados",
  },
};

export function getAgentConfig(type?: string | null): AgentTypeConfig {
  return AGENT_TYPE_CONFIG[(type as AgentType) ?? "guia"] ?? AGENT_TYPE_CONFIG.guia;
}
