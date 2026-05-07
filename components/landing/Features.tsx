import ScrollReveal from "./ScrollReveal";

function IconClock() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  );
}
function IconRepeat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconCursor() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
function IconUserCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}

const SIGNALS = [
  {
    Icon: IconClock,
    title: "Cuánto tiempo pasaste en cada sección",
    body: "Si llevás 60s en precios, el agente lo sabe. Y sabe qué decirte.",
    code: "pricing.time: 67s",
    color: "rgba(124,108,255,1)",
    colorDim: "rgba(124,108,255,0.12)",
    colorBorder: "rgba(124,108,255,0.22)",
  },
  {
    Icon: IconRepeat,
    title: "A qué volviste más de una vez",
    body: "Volviste a comparar planes tres veces. Hay una duda. El agente la resuelve.",
    code: "pricing.revisits: 3",
    color: "rgba(99,184,255,1)",
    colorDim: "rgba(99,184,255,0.1)",
    colorBorder: "rgba(99,184,255,0.2)",
  },
  {
    Icon: IconSearch,
    title: "De dónde venís y qué buscabas",
    body: "Si llegaste de Google buscando algo, el agente ya sabe de qué hablar.",
    code: 'searchQuery: "agente ai"',
    color: "rgba(232,160,144,1)",
    colorDim: "rgba(232,160,144,0.1)",
    colorBorder: "rgba(232,160,144,0.2)",
  },
  {
    Icon: IconCursor,
    title: "En qué te detuviste",
    body: "El cursor paró 8 segundos en una feature. Eso es interés. El agente lo nota.",
    code: 'hovered: "plan-pro"',
    color: "rgba(61,214,143,1)",
    colorDim: "rgba(61,214,143,0.1)",
    colorBorder: "rgba(61,214,143,0.2)",
  },
  {
    Icon: IconMoon,
    title: "Qué hora es donde estás",
    body: "Son las 11pm. El agente es conciso. No te da un ensayo.",
    code: "localHour: 23",
    color: "rgba(168,148,255,1)",
    colorDim: "rgba(168,148,255,0.1)",
    colorBorder: "rgba(168,148,255,0.2)",
  },
  {
    Icon: IconUserCheck,
    title: "Si ya estuviste antes",
    body: "Segunda visita. El agente asume que ya conocés el concepto.",
    code: "isReturnVisitor: true",
    color: "rgba(245,158,11,1)",
    colorDim: "rgba(245,158,11,0.1)",
    colorBorder: "rgba(245,158,11,0.2)",
  },
];

export default function Features() {
  return (
    <section data-section="features" className="section-y relative">
      <div className="section-divider-top" />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(124,108,255,0.045) 0%, transparent 100%)" }} />

      <div className="wrap" style={{ position: "relative" }}>
        <ScrollReveal style={{ textAlign: "center", marginBottom: 64 }}>
          <p className="kicker kicker-accent">Behavioral tracking</p>
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
              <div className="feature-card" style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: s.colorDim, border: `1px solid ${s.colorBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: s.color, marginBottom: 18,
                  transition: "transform 0.2s ease",
                }}>
                  <s.Icon />
                </div>
                <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.9375rem", color: "var(--c-text)", lineHeight: 1.3, marginBottom: 10 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.65, color: "var(--c-muted)", flex: 1, marginBottom: 16 }}>
                  {s.body}
                </p>
                <div style={{
                  fontFamily: "monospace", fontSize: "0.72rem", padding: "9px 13px", borderRadius: 9,
                  background: s.colorDim, border: `1px solid ${s.colorBorder}`,
                  color: s.color,
                  letterSpacing: "0.02em",
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
        .feature-card {
          background: linear-gradient(165deg, var(--c-surface) 0%, var(--c-surface2) 100%);
          border: 1px solid var(--c-border);
          border-radius: var(--radius-lg);
          transition: border-color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease;
          box-shadow: 0 4px 24px rgba(0,0,0,0.2);
        }
        .feature-card:hover {
          border-color: var(--c-border2);
          transform: translateY(-4px);
          box-shadow: 0 20px 52px rgba(0,0,0,0.38), 0 0 0 1px rgba(124,108,255,0.07);
        }
        .feature-card:hover > div:first-child {
          transform: scale(1.08);
        }
      `}</style>
    </section>
  );
}
