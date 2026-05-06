import ScrollReveal from "./ScrollReveal";

const SIGNALS = [
  {
    icon: "⏱",
    title: "Cuánto tiempo pasaste en cada sección",
    body: "Si llevás 60s en precios, el agente lo sabe. Y sabe qué decirte.",
    code: "pricing.time: 67s",
  },
  {
    icon: "🔄",
    title: "A qué volviste más de una vez",
    body: "Volviste a comparar planes tres veces. Hay una duda. El agente la resuelve.",
    code: "pricing.revisits: 3",
  },
  {
    icon: "🔍",
    title: "De dónde venís y qué buscabas",
    body: "Si llegaste de Google buscando algo específico, el agente ya sabe de qué hablar.",
    code: 'searchQuery: "agente ai"',
  },
  {
    icon: "📍",
    title: "En qué te detuviste",
    body: "El cursor paró 8 segundos en una feature. Eso es interés. El agente lo nota.",
    code: 'hovered: "plan-pro"',
  },
  {
    icon: "🕐",
    title: "Qué hora es donde estás",
    body: "Son las 11pm. El agente es conciso. No te da un ensayo cuando querés rapidez.",
    code: "localHour: 23",
  },
  {
    icon: "🔁",
    title: "Si ya estuviste antes",
    body: "Segunda visita. El agente asume que ya conocés el concepto. No explica desde cero.",
    code: "isReturnVisitor: true",
  },
];

export default function Features() {
  return (
    <section data-section="features" className="py-28 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.05)] to-transparent" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.03) 0%, transparent 100%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        <ScrollReveal className="text-center mb-16">
          <p className="text-xs text-accent/70 uppercase tracking-widest font-medium mb-4">
            Behavioral tracking
          </p>
          <h2
            className="font-syne font-black text-[#eeeae4] leading-[0.9] mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", letterSpacing: "-0.03em" }}
          >
            Entiende sin que<br />digas nada.
          </h2>
          <p className="text-[rgba(238,234,228,0.4)] font-light text-lg max-w-lg mx-auto">
            Antes de que el visitante abra la boca, Meetzy ya tiene contexto.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SIGNALS.map((s, i) => (
            <ScrollReveal key={i} className={`reveal-d${(i % 3) + 1}`}>
              <div className="card p-6 h-full flex flex-col">
                <div className="text-2xl mb-4">{s.icon}</div>
                <h3 className="font-syne font-bold text-[#eeeae4] text-base mb-2 leading-snug">
                  {s.title}
                </h3>
                <p className="text-sm text-[rgba(238,234,228,0.4)] leading-relaxed mb-4 flex-1">
                  {s.body}
                </p>
                <div className="font-mono text-[10px] text-accent/60 bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.12)] rounded-lg px-3 py-2">
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
