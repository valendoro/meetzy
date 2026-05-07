import ScrollReveal from "./ScrollReveal";

const TESTIMONIALS = [
  {
    quote: "En la primera semana Milo agendó 11 turnos de urgencias sin que yo tocara el teléfono. Me cambió la vida.",
    name: "Valentina Sosa",
    role: "Veterinaria Sol del Norte",
    initials: "VS",
    color: "#2563eb",
  },
  {
    quote: "Teníamos un 60% de rebote en pricing. Desde que pusimos Milo bajó al 22%. Las preguntas se responden solas.",
    name: "Martín Ferreyra",
    role: "Fundador de SaaS B2B",
    initials: "MF",
    color: "#7c6cff",
  },
  {
    quote: "El avatar tiene la naranja de nuestra marca. Cuando los clientes lo ven se ríen y preguntan. Es inevitable.",
    name: "Claudia Ruiz",
    role: "Almacén Don Ramón, Córdoba",
    initials: "CR",
    color: "#f97316",
  },
];

function Stars() {
  return (
    <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="section-y relative" style={{ paddingTop: "calc(var(--section-y) * 0.7)" }}>
      <div className="section-divider-top" />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 45% at 50% 100%, rgba(124,108,255,0.04), transparent 65%)" }} />

      <div className="wrap" style={{ position: "relative" }}>
        <ScrollReveal style={{ textAlign: "center", marginBottom: 56 }}>
          <p className="kicker kicker-accent">Lo que dicen</p>
          <h2 className="display display-lg">
            Resultados reales.<br />
            <span style={{ color: "var(--c-muted2)" }}>No promesas.</span>
          </h2>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }} className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <ScrollReveal key={i} className={`reveal-d${i + 1}`}>
              <div className="testimonial-card" style={{ padding: "1.75rem 2rem", display: "flex", flexDirection: "column" }}>
                <Stars />

                <p style={{
                  fontSize: "0.9375rem", lineHeight: 1.7,
                  color: "var(--c-text)", fontStyle: "italic",
                  flex: 1, marginBottom: 24,
                  opacity: 0.88,
                }}>
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 18 }} />

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                    background: `${t.color}18`, border: `1px solid ${t.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-syne)", fontWeight: 800,
                    fontSize: "0.72rem", color: t.color,
                  }}>
                    {t.initials}
                  </div>
                  <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--c-text)", lineHeight: 1.2 }}>
                      {t.name}
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "var(--c-muted2)", marginTop: 2 }}>
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .testimonials-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        .testimonial-card {
          background: linear-gradient(155deg, rgba(32,31,44,0.65) 0%, var(--c-surface) 100%);
          border: 1px solid var(--c-border);
          border-radius: var(--radius-xl);
          box-shadow: 0 8px 36px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.03) inset;
          transition: border-color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease;
        }
        .testimonial-card:hover {
          border-color: rgba(124,108,255,0.24);
          transform: translateY(-4px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.38), 0 0 0 1px rgba(124,108,255,0.06) inset;
        }
      `}</style>
    </section>
  );
}
