import ScrollReveal from "./ScrollReveal";

const STEPS = [
  { n: "01", icon: "🔗", title: "Pegás tu URL", body: "Meetzy lee tu sitio completo. Aprende todo lo que necesita sobre tu negocio en segundos.", detail: "Productos, precios, horarios, servicios, tono." },
  { n: "02", icon: "🎭", title: "Elegís cómo se ve", body: "Humano, animal, objeto — lo que represente tu marca. Con tus colores y tu logo.", detail: "La naranja de tu frutería. La chomba con tu logo." },
  { n: "03", icon: "⚡", title: "Una línea de código", body: "O cero líneas si usás Webflow, WordPress o Shopify. Listo en 10 minutos.", detail: "El agente empieza a observar desde el primer visitante." },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" data-section="how" className="section-y relative">
      <div className="section-divider-top" />

      <div className="wrap">
        <ScrollReveal style={{ textAlign: "center", marginBottom: 64 }}>
          <p className="kicker kicker-accent">Cómo funciona</p>
          <h2 className="display display-lg">
            De cero a agente<br />en 10 minutos.
          </h2>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }} className="how-grid">
          {STEPS.map((step, i) => (
            <ScrollReveal key={i} className={`reveal-d${i + 1}`}>
              <div className="card" style={{ padding: "2rem", height: "100%", position: "relative", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", top: 16, right: 16,
                  fontFamily: "var(--font-syne)", fontWeight: 800,
                  fontSize: "4.5rem", lineHeight: 1,
                  color: "rgba(255,255,255,0.025)",
                  userSelect: "none",
                }}>
                  {step.n}
                </div>
                <div style={{ fontSize: "1.5rem", marginBottom: 20 }}>{step.icon}</div>
                <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1.1rem", color: "var(--c-text)", marginBottom: 12 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.65, color: "var(--c-muted)", marginBottom: 12 }}>{step.body}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--c-muted2)" }}>{step.detail}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal style={{ marginTop: 32 }}>
          <div style={{
            background: "rgba(10,10,14,0.9)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, padding: "20px 24px", maxWidth: 420, margin: "0 auto",
          }}>
            <p style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--c-muted2)", marginBottom: 12 }}>
              El script más simple del mundo
            </p>
            <pre style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "rgba(236,234,229,0.6)", lineHeight: 1.8, overflow: "auto" }}>
              {`<script>
  window.MEETZYCONFIG = { siteId: `}
              <span style={{ color: "#86efac" }}>{'"tu-id"'}</span>
              {` };
</script>
<script src=`}
              <span style={{ color: "var(--c-accent)" }}>{'"https://meetzy.ai/widget.js"'}</span>
              {` async></script>`}
            </pre>
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @media (min-width: 768px) { .how-grid { grid-template-columns: repeat(3, 1fr) !important; } }
      `}</style>
    </section>
  );
}
