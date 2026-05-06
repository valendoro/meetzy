import ScrollReveal from "./ScrollReveal";

const SIGNALS = [
  { icon: "⏱", title: "Cuánto tiempo pasaste en cada sección", body: "Si llevás 60s en precios, el agente lo sabe. Y sabe qué decirte.", code: "pricing.time: 67s" },
  { icon: "🔄", title: "A qué volviste más de una vez", body: "Volviste a comparar planes tres veces. Hay una duda. El agente la resuelve.", code: "pricing.revisits: 3" },
  { icon: "🔍", title: "De dónde venís y qué buscabas", body: "Si llegaste de Google buscando algo, el agente ya sabe de qué hablar.", code: 'searchQuery: "agente ai"' },
  { icon: "📍", title: "En qué te detuviste", body: "El cursor paró 8 segundos en una feature. Eso es interés. El agente lo nota.", code: 'hovered: "plan-pro"' },
  { icon: "🕐", title: "Qué hora es donde estás", body: "Son las 11pm. El agente es conciso. No te da un ensayo.", code: "localHour: 23" },
  { icon: "🔁", title: "Si ya estuviste antes", body: "Segunda visita. El agente asume que ya conocés el concepto.", code: "isReturnVisitor: true" },
];

export default function Features() {
  return (
    <section data-section="features" style={{ padding: "112px 0", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)" }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(99,102,241,0.03) 0%, transparent 100%)" }} />

      <div className="wrap" style={{ position: "relative" }}>
        <ScrollReveal style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(99,102,241,0.8)", marginBottom: 16 }}>
            Behavioral tracking
          </p>
          <h2 className="display display-lg" style={{ marginBottom: 16 }}>
            Entiende sin que<br />digas nada.
          </h2>
          <p style={{ fontSize: "1.1rem", fontWeight: 300, color: "var(--c-muted)", maxWidth: 500, margin: "0 auto" }}>
            Antes de que el visitante abra la boca, Meetzy ya tiene contexto.
          </p>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }} className="features-grid">
          {SIGNALS.map((s, i) => (
            <ScrollReveal key={i} className={`reveal-d${(i % 3) + 1}`}>
              <div className="card" style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "1.4rem", marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.95rem", color: "var(--c-text)", lineHeight: 1.35, marginBottom: 10 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.65, color: "var(--c-muted)", flex: 1, marginBottom: 16 }}>
                  {s.body}
                </p>
                <div style={{
                  fontFamily: "monospace", fontSize: "0.72rem", padding: "8px 12px", borderRadius: 8,
                  background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)",
                  color: "rgba(99,102,241,0.85)",
                }}>
                  {s.code}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 640px)  { .features-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (min-width: 1024px) { .features-grid { grid-template-columns: repeat(3, 1fr) !important; } }
      `}</style>
    </section>
  );
}
