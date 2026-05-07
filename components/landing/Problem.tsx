import ScrollReveal from "./ScrollReveal";

function IconMoon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
function IconHelpCircle() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
    </svg>
  );
}
function IconShoppingBag() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
    accentRgb: "129,140,248",
    label: "Son las 11pm",
    situation: "Una mamá busca veterinaria de urgencias para su gato enfermo. Tu web tiene un horario en el footer.",
    without: "Horario cerrado. Nadie responde.",
    result: "Turno de urgencia agendado.",
  },
  {
    Icon: IconHelpCircle,
    accent: "#34d399",
    accentRgb: "52,211,153",
    label: "No entiende qué vendés",
    situation: "Un cliente lee tres párrafos de «soluciones integrales». No entiende nada. Se va.",
    without: "Formulario de contacto genérico.",
    result: "Reunión agendada con contexto.",
  },
  {
    Icon: IconShoppingBag,
    accent: "#f59e0b",
    accentRgb: "245,158,11",
    label: "Llegó listo para comprar",
    situation: "Tenía la plata, el problema y las ganas. Solo necesitaba que alguien le respondiera. No había nadie.",
    without: "Carrito abandonado.",
    result: "Compra completada en minutos.",
  },
];

export default function Problem() {
  return (
    <section data-section="problem" className="section-y relative">
      <div className="section-divider-top" />

      <div className="wrap">
        <ScrollReveal style={{ textAlign: "center", marginBottom: 72 }}>
          <p className="kicker kicker-accent">El problema</p>
          <h2 className="display display-lg" style={{ marginBottom: 16 }}>
            Tu web habla.<br />
            <span style={{ color: "var(--c-muted2)" }}>Pero no escucha.</span>
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--c-muted)", maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>
            Cada visitante tiene un contexto. Sin Meetzy, tu web los trata a todos igual.
          </p>
        </ScrollReveal>

        <div className="problem-grid">
          {CARDS.map((c, i) => (
            <ScrollReveal key={i} className={`reveal-d${i + 1}`}>
              <div
                className="problem-card"
                style={{ "--accent": c.accent, "--accent-rgb": c.accentRgb } as React.CSSProperties}
              >
                {/* Top accent bar */}
                <div className="problem-card-bar" />

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div className="problem-icon-wrap">
                    <c.Icon />
                  </div>
                  <span className="problem-label">{c.label}</span>
                </div>

                <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--c-muted)", flex: 1, marginBottom: 24 }}>
                  {c.situation}
                </p>

                <div className="problem-compare">
                  <div className="problem-without">
                    <span className="problem-compare-label">Sin Meetzy</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--c-muted2)" }}>{c.without}</span>
                  </div>
                  <div className="problem-with">
                    <span className="problem-compare-label" style={{ color: "var(--accent)" }}>Con Meetzy</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--accent)" }}>{c.result}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <style>{`
        .problem-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .problem-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .problem-card {
          position: relative;
          padding: 1.75rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          background: linear-gradient(155deg, rgba(28,27,40,0.98) 0%, rgba(20,19,30,0.99) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 4px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset;
          transition: border-color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease;
          overflow: hidden;
        }
        .problem-card:hover {
          border-color: rgba(var(--accent-rgb), 0.35);
          transform: translateY(-4px);
          box-shadow: 0 20px 52px rgba(0,0,0,0.5), 0 0 0 1px rgba(var(--accent-rgb), 0.1) inset;
        }
        .problem-card-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent), transparent);
          opacity: 0.7;
        }
        .problem-icon-wrap {
          width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
          background: rgba(var(--accent-rgb), 0.12);
          border: 1px solid rgba(var(--accent-rgb), 0.28);
          display: flex; align-items: center; justify-content: center;
          color: var(--accent);
        }
        .problem-label {
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--accent);
        }
        .problem-compare {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 18px;
        }
        .problem-without {
          display: flex; flex-direction: column; gap: 4px;
          padding: 10px 12px; border-radius: 10px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .problem-with {
          display: flex; flex-direction: column; gap: 4px;
          padding: 10px 12px; border-radius: 10px;
          background: rgba(var(--accent-rgb), 0.07);
          border: 1px solid rgba(var(--accent-rgb), 0.2);
        }
        .problem-compare-label {
          font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--c-muted2);
          display: block; margin-bottom: 2px;
        }
      `}</style>
    </section>
  );
}
