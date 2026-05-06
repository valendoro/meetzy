import ScrollReveal from "./ScrollReveal";

const SIGNALS = [
  { icon: "⏱", title: "Cuánto tiempo pasaste en cada sección", body: "Si llevás 60s en precios, el agente lo sabe. Y sabe qué decirte.", code: "pricing.time: 67s" },
  { icon: "🔄", title: "A qué volviste más de una vez", body: "Volviste a comparar planes tres veces. Hay una duda. El agente la resuelve.", code: "pricing.revisits: 3" },
  { icon: "🔍", title: "De dónde venís y qué buscabas", body: "Si llegaste de Google buscando algo, el agente ya sabe de qué hablar.", code: 'searchQuery: "agente ai"' },
  { icon: "📍", title: "En qué te detuviste", body: "El cursor paró 8 segundos en una feature. Eso es interés. El agente lo nota.", code: 'hovered: "plan-pro"' },
  { icon: "🕐", title: "Qué hora es donde estás", body: "Son las 11pm. El agente es conciso. No te da un ensayo cuando querés rapidez.", code: "localHour: 23" },
  { icon: "🔁", title: "Si ya estuviste antes", body: "Segunda visita. El agente asume que ya conocés el concepto. No explica desde cero.", code: "isReturnVisitor: true" },
];

export default function Features() {
  return (
    <section data-section="features" className="py-28 relative">
      <div className="section-divider absolute top-0 inset-x-0" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(99,102,241,0.03) 0%, transparent 100%)"
      }} />

      <div className="relative max-w-6xl mx-auto px-6">
        <ScrollReveal className="text-center mb-16">
          <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: "rgba(99,102,241,0.75)" }}>
            Behavioral tracking
          </p>
          <h2 className="font-syne font-black text-[#eeeae4] leading-[0.9] mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", letterSpacing: "-0.035em" }}>
            Entiende sin que<br />digas nada.
          </h2>
          <p style={{ color: "rgba(238,234,228,0.4)", fontSize: "1.1rem", fontWeight: 300 }}>
            Antes de que el visitante abra la boca, Meetzy ya tiene contexto.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SIGNALS.map((s, i) => (
            <ScrollReveal key={i} className={`reveal-d${(i % 3) + 1}`}>
              <div className="h-full flex flex-col rounded-2xl p-6 transition-all duration-200 group"
                style={{
                  background: "rgba(14,14,20,0.8)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(16,16,22,0.9)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(14,14,20,0.8)";
                }}
              >
                <div className="text-2xl mb-4">{s.icon}</div>
                <h3 className="font-syne font-bold text-[#eeeae4] text-[0.95rem] mb-2.5 leading-snug">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: "rgba(238,234,228,0.4)" }}>
                  {s.body}
                </p>
                <div className="font-mono text-[11px] px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(99,102,241,0.07)",
                    border: "1px solid rgba(99,102,241,0.15)",
                    color: "rgba(99,102,241,0.8)",
                  }}>
                  {s.code}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
