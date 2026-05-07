import ScrollReveal from "./ScrollReveal";

function IconClock() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>;
}
function IconRepeat() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>;
}
function IconSearch() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function IconCursor() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l7.07 17 2.51-7.39L21 11.07z"/></svg>;
}
function IconMoon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>;
}
function IconUserCheck() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>;
}

const SIGNALS = [
  { Icon: IconClock, title: "Tiempo por sección", body: "Si llevás 60s en precios, el agente lo sabe. Y sabe qué decirte.", code: "pricing.time: 67s", color: "#818cf8", rgb: "129,140,248" },
  { Icon: IconRepeat, title: "A qué volviste", body: "Volviste a comparar planes tres veces. Hay una duda. El agente la resuelve.", code: "pricing.revisits: 3", color: "#63b8ff", rgb: "99,184,255" },
  { Icon: IconSearch, title: "De dónde venís", body: "Si llegaste de Google buscando algo, el agente ya sabe de qué hablar.", code: 'searchQuery: "agente ai"', color: "#e8a090", rgb: "232,160,144" },
  { Icon: IconCursor, title: "En qué te detuviste", body: "El cursor paró 8 segundos en una feature. Eso es interés. El agente lo nota.", code: 'hovered: "plan-pro"', color: "#3dd68f", rgb: "61,214,143" },
  { Icon: IconMoon, title: "Qué hora es", body: "Son las 11pm. El agente es conciso. No te da un ensayo.", code: "localHour: 23", color: "#a894ff", rgb: "168,148,255" },
  { Icon: IconUserCheck, title: "Si ya estuviste antes", body: "Segunda visita. El agente asume que ya conocés el concepto.", code: "isReturnVisitor: true", color: "#f59e0b", rgb: "245,158,11" },
];

export default function Features() {
  return (
    <section data-section="features" className="section-y relative">
      <div className="section-divider-top" />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(124,108,255,0.06) 0%, transparent 70%)" }} />

      <div className="wrap" style={{ position: "relative" }}>
        <ScrollReveal style={{ textAlign: "center", marginBottom: 72 }}>
          <p className="kicker kicker-accent">Behavioral tracking</p>
          <h2 className="display display-lg" style={{ marginBottom: 16 }}>
            Entiende sin que<br />digas nada.
          </h2>
          <p style={{ fontSize: "1rem", fontWeight: 300, color: "var(--c-muted)", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>
            Antes de que el visitante abra la boca, Meetzy ya tiene contexto completo.
          </p>
        </ScrollReveal>

        <div className="features-grid">
          {SIGNALS.map((s, i) => (
            <ScrollReveal key={i} className={`reveal-d${(i % 3) + 1}`}>
              <div
                className="feature-card"
                style={{ "--color": s.color, "--rgb": s.rgb } as React.CSSProperties}
              >
                <div className="feature-icon">
                  <s.Icon />
                </div>
                <h3 className="feature-title">{s.title}</h3>
                <p className="feature-body">{s.body}</p>
                <div className="feature-code">{s.code}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <style>{`
        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 640px)  { .features-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; } }
        @media (min-width: 1024px) { .features-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }

        .feature-card {
          position: relative;
          padding: 1.5rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          background: linear-gradient(150deg, rgba(26,25,38,0.98) 0%, rgba(18,17,28,0.99) 100%);
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 4px 28px rgba(0,0,0,0.38), 0 1px 0 rgba(255,255,255,0.04) inset;
          transition: border-color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease;
          overflow: hidden;
        }
        .feature-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(var(--rgb), 0.6), transparent);
        }
        .feature-card:hover {
          border-color: rgba(var(--rgb), 0.3);
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.5), 0 0 40px rgba(var(--rgb), 0.06);
        }
        .feature-icon {
          width: 50px; height: 50px; border-radius: 14px; flex-shrink: 0;
          background: rgba(var(--rgb), 0.12);
          border: 1px solid rgba(var(--rgb), 0.25);
          display: flex; align-items: center; justify-content: center;
          color: var(--color);
          margin-bottom: 18px;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .feature-card:hover .feature-icon {
          transform: scale(1.1);
          background: rgba(var(--rgb), 0.18);
        }
        .feature-title {
          font-family: var(--font-syne);
          font-weight: 700;
          font-size: 0.9375rem;
          color: var(--c-text);
          line-height: 1.3;
          margin-bottom: 10px;
        }
        .feature-body {
          font-size: 0.84rem;
          line-height: 1.65;
          color: var(--c-muted);
          flex: 1;
          margin-bottom: 18px;
        }
        .feature-code {
          font-family: var(--font-mono, "JetBrains Mono", monospace);
          font-size: 0.72rem;
          padding: 9px 13px;
          border-radius: 9px;
          background: rgba(var(--rgb), 0.09);
          border: 1px solid rgba(var(--rgb), 0.22);
          color: var(--color);
          letter-spacing: 0.02em;
        }
      `}</style>
    </section>
  );
}
