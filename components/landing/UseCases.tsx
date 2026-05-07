"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

const CASES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.5 21a9 9 0 100-18 9 9 0 000 18z"/><path d="M21.17 8H19a2 2 0 00-2 2v.5M7 19.5V17a2 2 0 012-2h.5"/>
      </svg>
    ),
    label: "Veterinaria",
    color: "#2563eb",
    avatarEmoji: "🐶",
    what: "Agenda urgencias a las 11pm. Calma a dueños preocupados. Explica tratamientos sin que esperen.",
    without: "Horario de atención en el footer.",
    result: "Turno agendado, dueño tranquilo.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H5l1.88 8.78A2 2 0 008.82 20h6.36a2 2 0 001.94-1.54L19 9.1h1.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
      </svg>
    ),
    label: "Marca de ropa",
    color: "#e11d48",
    avatarEmoji: "👗",
    what: "Recomienda talles. Muestra stock. Procesa dudas sobre materiales y cuidados.",
    without: "Página de producto sin respuestas.",
    result: "Compra completada.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
    label: "Frutería",
    color: "#f97316",
    avatarEmoji: "🛒",
    what: "Toma pedidos de cajones. Informa precios de temporada. Agenda delivery.",
    without: "WhatsApp que nadie responde.",
    result: "Pedido tomado en 2 minutos.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    label: "Estudio jurídico",
    color: "#7c3aed",
    avatarEmoji: "📋",
    what: "Escucha el problema. Identifica el área legal. Deriva al abogado correcto con contexto.",
    without: "Formulario genérico de contacto.",
    result: "Consulta agendada con contexto.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    label: "Inmobiliaria",
    color: "#059669",
    avatarEmoji: "🔑",
    what: "Infiere el perfil del comprador. Filtra propiedades. Agenda visitas al instante.",
    without: "Grilla de propiedades infinita.",
    result: "Visita agendada en 5 minutos.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
    label: "Instituto",
    color: "#0891b2",
    avatarEmoji: "📚",
    what: "Explica programas. Responde dudas de inscripción. Agenda entrevistas con padres.",
    without: "PDF del programa.",
    result: "Inscripción iniciada.",
  },
];

export default function UseCases() {
  const [active, setActive] = useState(0);
  const c = CASES[active]!;

  return (
    <section id="para-quien" data-section="use-cases" className="section-y relative">
      <div className="section-divider-top" />

      <div className="wrap">
        <ScrollReveal style={{ textAlign: "center", marginBottom: 64 }}>
          <p className="kicker kicker-accent">Para quién</p>
          <h2 className="display display-lg">
            Un agente que entiende<br />cualquier negocio.
          </h2>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }} className="use-cases-layout">
          {/* Selector column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {CASES.map((cas, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  width: "100%", textAlign: "left",
                  padding: "10px 14px", borderRadius: 12,
                  display: "flex", alignItems: "center", gap: 12,
                  cursor: "pointer", transition: "all 0.18s ease",
                  border: active === i ? "1px solid var(--c-border2)" : "1px solid transparent",
                  background: active === i ? "rgba(255,255,255,0.04)" : "transparent",
                  color: active === i ? "var(--c-text)" : "var(--c-muted)",
                }}
                onMouseEnter={e => {
                  if (i !== active) {
                    (e.currentTarget as HTMLElement).style.color = "var(--c-text)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border)";
                  }
                }}
                onMouseLeave={e => {
                  if (i !== active) {
                    (e.currentTarget as HTMLElement).style.color = "var(--c-muted)";
                    (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                  }
                }}
              >
                <span style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: active === i ? `${cas.color}15` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active === i ? `${cas.color}30` : "transparent"}`,
                  color: active === i ? cas.color : "var(--c-muted)",
                  transition: "all 0.18s ease",
                }}>
                  {cas.icon}
                </span>
                <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{cas.label}</span>
                {active === i && (
                  <svg style={{ marginLeft: "auto", flexShrink: 0, color: "var(--c-muted2)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Detail card */}
          <div
            key={active}
            className="use-case-detail anim-fade-in"
            style={{ padding: "2rem", height: "100%" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 24 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 16, flexShrink: 0,
                background: `${c.color}12`, border: `1px solid ${c.color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.75rem",
              }}>
                {c.avatarEmoji}
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.15rem", color: "var(--c-text)", marginBottom: 4, lineHeight: 1.2 }}>
                  {c.label}
                </p>
                <p style={{ fontSize: "0.8125rem", color: "var(--c-muted)", marginBottom: 8 }}>Lo que Meetzy hace:</p>
                <p style={{ fontSize: "0.9375rem", color: "var(--c-text)", lineHeight: 1.65, opacity: 0.9 }}>
                  {c.what}
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{
                background: "rgba(255,255,255,0.025)", border: "1px solid var(--c-border)",
                borderRadius: 12, padding: "14px 16px",
              }}>
                <p style={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--c-muted2)", fontWeight: 700, marginBottom: 8 }}>
                  Sin Meetzy
                </p>
                <p style={{ fontSize: "0.875rem", color: "var(--c-muted)", lineHeight: 1.5 }}>{c.without}</p>
              </div>
              <div style={{
                background: `${c.color}08`, border: `1px solid ${c.color}22`,
                borderRadius: 12, padding: "14px 16px",
              }}>
                <p style={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 8, color: `${c.color}cc` }}>
                  Con Meetzy
                </p>
                <p style={{ fontSize: "0.875rem", fontWeight: 600, color: c.color, lineHeight: 1.5 }}>{c.result}</p>
              </div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--c-muted)", marginTop: 48, maxWidth: 560, margin: "48px auto 0", lineHeight: 1.65, opacity: 0.8 }}>
          Plan Pro: elegís el tipo y aplicamos tu marca.
          Plan Elite: el personaje habla con voz real y lip sync.
        </p>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .use-cases-layout { grid-template-columns: 220px 1fr !important; }
        }
        .use-case-detail {
          background: linear-gradient(165deg, var(--c-surface) 0%, var(--c-surface2) 100%);
          border: 1px solid var(--c-border);
          border-radius: var(--radius-xl);
          box-shadow: 0 8px 36px rgba(0,0,0,0.28);
        }
      `}</style>
    </section>
  );
}
