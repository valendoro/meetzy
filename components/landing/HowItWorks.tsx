import ScrollReveal from "./ScrollReveal";

function IconLink() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}
function IconPalette() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="17.5" cy="10.5" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="8.5" cy="7.5" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="6.5" cy="12.5" r="1.5" fill="currentColor" stroke="none"/>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2v-1.5c0-.83-.67-1.5-1.5-1.5H11c-2.76 0-5-2.24-5-5s2.24-5 5-5h1" />
    </svg>
  );
}
function IconZap() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

const STEPS = [
  {
    Icon: IconLink,
    n: "01",
    title: "Pegás tu URL",
    body: "Meetzy lee tu sitio completo. Aprende todo lo que necesita sobre tu negocio en segundos.",
    detail: "Productos, precios, horarios, servicios, tono.",
    color: "rgba(124,108,255,1)",
    colorDim: "rgba(124,108,255,0.12)",
    colorBorder: "rgba(124,108,255,0.25)",
  },
  {
    Icon: IconPalette,
    n: "02",
    title: "Elegís cómo se ve",
    body: "Humano, animal, objeto — lo que represente tu marca. Con tus colores y tu logo.",
    detail: "La naranja de tu frutería. La chomba con tu logo.",
    color: "rgba(232,160,144,1)",
    colorDim: "rgba(232,160,144,0.1)",
    colorBorder: "rgba(232,160,144,0.22)",
  },
  {
    Icon: IconZap,
    n: "03",
    title: "Una línea de código",
    body: "O cero líneas si usás Webflow, WordPress o Shopify. Listo en 10 minutos.",
    detail: "El agente empieza a observar desde el primer visitante.",
    color: "rgba(61,214,143,1)",
    colorDim: "rgba(61,214,143,0.1)",
    colorBorder: "rgba(61,214,143,0.22)",
  },
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

        <div style={{ position: "relative" }}>
          {/* Connector line (desktop) */}
          <div className="how-connector" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }} className="how-grid">
            {STEPS.map((step, i) => (
              <ScrollReveal key={i} className={`reveal-d${i + 1}`}>
                <div className="how-card" style={{ padding: "2rem", height: "100%", position: "relative", overflow: "hidden" }}>
                  {/* Ghost number */}
                  <div style={{
                    position: "absolute", top: 12, right: 16,
                    fontFamily: "var(--font-syne)", fontWeight: 800,
                    fontSize: "4.5rem", lineHeight: 1,
                    color: "rgba(255,255,255,0.028)",
                    userSelect: "none", pointerEvents: "none",
                  }}>
                    {step.n}
                  </div>

                  {/* Step badge + icon */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: step.colorDim, border: `1px solid ${step.colorBorder}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: step.color, flexShrink: 0,
                    }}>
                      <step.Icon />
                    </div>
                    <span style={{
                      fontFamily: "var(--font-syne)", fontWeight: 800,
                      fontSize: "0.65rem", letterSpacing: "0.14em",
                      textTransform: "uppercase", color: step.color,
                    }}>
                      Paso {step.n}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1.05rem", color: "var(--c-text)", marginBottom: 12 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "0.9rem", lineHeight: 1.65, color: "var(--c-muted)", marginBottom: 10 }}>
                    {step.body}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--c-muted2)" }}>{step.detail}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal style={{ marginTop: 36 }}>
          <div style={{
            background: "rgba(10,10,14,0.9)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, padding: "20px 24px", maxWidth: 440, margin: "0 auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--c-green)", boxShadow: "0 0 8px rgba(61,214,143,0.6)" }} />
              <p style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--c-muted2)" }}>
                El script más simple del mundo
              </p>
            </div>
            <pre style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "rgba(236,234,229,0.6)", lineHeight: 1.85, overflow: "auto" }}>
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
        .how-card {
          background: linear-gradient(165deg, var(--c-surface) 0%, var(--c-surface2) 100%);
          border: 1px solid var(--c-border);
          border-radius: var(--radius-lg);
          transition: border-color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease;
          box-shadow: 0 4px 24px rgba(0,0,0,0.2);
        }
        .how-card:hover {
          border-color: var(--c-border2);
          transform: translateY(-4px);
          box-shadow: 0 20px 52px rgba(0,0,0,0.38), 0 0 0 1px rgba(124,108,255,0.06);
        }
        .how-connector {
          display: none;
        }
        @media (min-width: 768px) {
          .how-connector {
            display: block;
            position: absolute;
            top: 34px;
            left: calc(33.33% - 22px);
            right: calc(33.33% - 22px);
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(124,108,255,0.3), rgba(124,108,255,0.3), transparent);
            pointer-events: none;
            z-index: 0;
          }
        }
      `}</style>
    </section>
  );
}
