import ScrollReveal from "./ScrollReveal";

const CARDS = [
  {
    icon: "🌙",
    time: "Son las 11pm",
    situation: "Una mamá busca veterinaria de urgencias para su gato enfermo. Tu web tiene un horario en el footer.",
    withMeetzy: "Meetzy responde al instante con el protocolo de urgencias y agenda el turno.",
    result: "Turno agendado.",
    color: "#818cf8",
  },
  {
    icon: "💭",
    time: "No entiende qué vendés",
    situation: "Un cliente lee tres párrafos de «soluciones integrales». No entiende nada. Se va.",
    withMeetzy: "Meetzy le pregunta qué problema tiene y le explica exactamente cómo lo resolvés.",
    result: "Reunión agendada.",
    color: "#34d399",
  },
  {
    icon: "💰",
    time: "Llegó listo",
    situation: "Tenía la plata, el problema y las ganas. Solo necesitaba que alguien le respondiera.",
    withMeetzy: "Con Meetzy, siempre hay alguien del otro lado.",
    result: "Compra completada.",
    color: "#f59e0b",
  },
];

export default function Problem() {
  return (
    <section data-section="problem" className="py-28 relative">
      <div className="section-divider absolute top-0 inset-x-0" />

      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal className="text-center mb-16">
          <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: "rgba(99,102,241,0.75)" }}>
            El problema
          </p>
          <h2 className="font-syne font-black text-[#eeeae4] leading-[0.9]"
            style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", letterSpacing: "-0.035em" }}>
            Tu web habla.
            <br />
            <span style={{ color: "rgba(238,234,228,0.28)" }}>Pero no escucha.</span>
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-5">
          {CARDS.map((card, i) => (
            <ScrollReveal key={i} className={`reveal-d${i + 1}`}>
              <div className="h-full flex flex-col rounded-2xl p-7 transition-all duration-200"
                style={{
                  background: "rgba(14,14,20,0.8)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                }}>
                {/* Icon + time */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${card.color}15`, border: `1px solid ${card.color}25` }}>
                    {card.icon}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: card.color }}>
                    {card.time}
                  </p>
                </div>

                {/* Situation */}
                <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: "rgba(238,234,228,0.45)" }}>
                  {card.situation}
                </p>

                {/* Divider */}
                <div className="mb-4" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

                {/* With Meetzy */}
                <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(238,234,228,0.3)" }}>
                  {card.withMeetzy}
                </p>

                {/* Result */}
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: card.color }} />
                  <span className="text-sm font-semibold text-[#eeeae4]">{card.result}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
