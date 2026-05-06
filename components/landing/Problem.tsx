import ScrollReveal from "./ScrollReveal";

const CARDS = [
  {
    icon: "🌙", accent: "#818cf8",
    time: "Son las 11pm",
    situation: "Una mamá busca veterinaria de urgencias para su gato enfermo. Tu web tiene un horario en el footer.",
    result: "Turno de urgencia agendado.",
  },
  {
    icon: "💭", accent: "#34d399",
    time: "No entiende qué vendés",
    situation: "Un cliente lee tres párrafos de «soluciones integrales». No entiende nada. Se va.",
    result: "Reunión agendada con contexto.",
  },
  {
    icon: "💰", accent: "#f59e0b",
    time: "Llegó listo para comprar",
    situation: "Tenía la plata, el problema y las ganas. Solo necesitaba que alguien le respondiera. No había nadie.",
    result: "Compra completada en minutos.",
  },
];

export default function Problem() {
  return (
    <section data-section="problem" style={{ padding: "112px 0", position: "relative" }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 1,
        background: "linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)"
      }} />

      <div className="wrap">
        <ScrollReveal style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(99,102,241,0.8)", marginBottom: 16 }}>
            El problema
          </p>
          <h2 className="display display-lg">
            Tu web habla.<br />
            <span style={{ color: "rgba(236,234,229,0.25)" }}>Pero no escucha.</span>
          </h2>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }} className="problem-grid">
          {CARDS.map((c, i) => (
            <ScrollReveal key={i} className={`reveal-d${i + 1}`}>
              <div className="card" style={{ padding: "1.75rem", height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: `${c.accent}14`, border: `1px solid ${c.accent}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.2rem",
                  }}>{c.icon}</div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: c.accent }}>
                    {c.time}
                  </span>
                </div>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.65, color: "var(--c-muted)", flex: 1, marginBottom: 20 }}>
                  {c.situation}
                </p>
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 16 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--c-text)" }}>{c.result}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .problem-grid { grid-template-columns: repeat(3, 1fr) !important; } }
      `}</style>
    </section>
  );
}
