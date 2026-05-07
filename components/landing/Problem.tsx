import ScrollReveal from "./ScrollReveal";

function IconMoon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
function IconHelpCircle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
    </svg>
  );
}
function IconShoppingBag() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

const CARDS = [
  {
    Icon: IconMoon,
    accent: "#818cf8",
    accentDim: "rgba(129,140,248,0.12)",
    accentBorder: "rgba(129,140,248,0.25)",
    time: "Son las 11pm",
    situation: "Una mamá busca veterinaria de urgencias para su gato enfermo. Tu web tiene un horario en el footer.",
    result: "Turno de urgencia agendado.",
  },
  {
    Icon: IconHelpCircle,
    accent: "#34d399",
    accentDim: "rgba(52,211,153,0.1)",
    accentBorder: "rgba(52,211,153,0.22)",
    time: "No entiende qué vendés",
    situation: "Un cliente lee tres párrafos de «soluciones integrales». No entiende nada. Se va.",
    result: "Reunión agendada con contexto.",
  },
  {
    Icon: IconShoppingBag,
    accent: "#f59e0b",
    accentDim: "rgba(245,158,11,0.1)",
    accentBorder: "rgba(245,158,11,0.22)",
    time: "Llegó listo para comprar",
    situation: "Tenía la plata, el problema y las ganas. Solo necesitaba que alguien le respondiera. No había nadie.",
    result: "Compra completada en minutos.",
  },
];

export default function Problem() {
  return (
    <section data-section="problem" className="section-y relative">
      <div className="section-divider-top" />

      <div className="wrap">
        <ScrollReveal style={{ textAlign: "center", marginBottom: 64 }}>
          <p className="kicker kicker-accent">El problema</p>
          <h2 className="display display-lg">
            Tu web habla.<br />
            <span style={{ color: "var(--c-muted2)" }}>Pero no escucha.</span>
          </h2>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }} className="problem-grid">
          {CARDS.map((c, i) => (
            <ScrollReveal key={i} className={`reveal-d${i + 1}`}>
              <div className="problem-card" style={{ padding: "1.75rem", height: "100%", display: "flex", flexDirection: "column" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: c.accentDim, border: `1px solid ${c.accentBorder}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: c.accent,
                  }}>
                    <c.Icon />
                  </div>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: c.accent,
                  }}>
                    {c.time}
                  </span>
                </div>

                {/* Situation */}
                <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--c-muted)", flex: 1, marginBottom: 22 }}>
                  {c.situation}
                </p>

                {/* Result */}
                <div style={{ height: 1, background: `linear-gradient(90deg, ${c.accentBorder}, transparent)`, marginBottom: 18 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: c.accent, flexShrink: 0,
                    boxShadow: `0 0 10px ${c.accent}88`,
                  }} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--c-text)" }}>
                    {c.result}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .problem-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        .problem-card {
          background: linear-gradient(165deg, var(--c-surface) 0%, var(--c-surface2) 100%);
          border: 1px solid var(--c-border);
          border-radius: var(--radius-lg);
          transition: border-color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease;
          box-shadow: 0 4px 24px rgba(0,0,0,0.2);
        }
        .problem-card:hover {
          border-color: var(--c-border2);
          transform: translateY(-4px);
          box-shadow: 0 20px 52px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.04);
        }
      `}</style>
    </section>
  );
}
