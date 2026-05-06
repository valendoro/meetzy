import ScrollReveal from "./ScrollReveal";

const CARDS = [
  {
    time: "Son las 11pm",
    situation: "Una mamá busca veterinaria de urgencias para su gato enfermo. Tu web tiene un horario en el footer.",
    withMeetzy: "Meetzy le responde al instante con el protocolo de urgencias y agenda el turno.",
    result: "Turno de urgencia agendado.",
    icon: "🌙",
  },
  {
    time: "No entiende qué vendés",
    situation: "Un cliente lee tres párrafos de «soluciones integrales». No entiende nada. Se va.",
    withMeetzy: "Meetzy le pregunta qué problema tiene y le explica exactamente cómo lo resolvés.",
    result: "Reunión agendada con contexto.",
    icon: "💭",
  },
  {
    time: "Llegó listo",
    situation: "Tenía la plata, el problema y las ganas. Solo necesitaba que alguien le respondiera. No había nadie.",
    withMeetzy: "Con Meetzy, siempre hay alguien.",
    result: "Con Meetzy, siempre hay alguien.",
    icon: "💰",
  },
];

export default function Problem() {
  return (
    <section data-section="problem" className="py-28 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.05)] to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal className="text-center mb-16">
          <p className="text-xs text-accent/70 uppercase tracking-widest font-medium mb-4">
            El problema
          </p>
          <h2
            className="font-syne font-black text-[#eeeae4] leading-[0.9]"
            style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", letterSpacing: "-0.03em" }}
          >
            Tu web habla.<br />
            <span className="text-[rgba(238,234,228,0.3)]">Pero no escucha.</span>
          </h2>
          <p className="mt-5 text-[rgba(238,234,228,0.4)] text-lg font-light max-w-lg mx-auto">
            Las webs están hechas para el promedio. Texto genérico para todos.
            Meetzy cambia eso.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-4">
          {CARDS.map((card, i) => (
            <ScrollReveal key={i} className={`reveal-d${i + 1}`}>
              <div className="card p-7 h-full flex flex-col">
                <div className="text-2xl mb-4">{card.icon}</div>
                <p className="text-xs text-accent/70 uppercase tracking-widest font-medium mb-3">
                  {card.time}
                </p>
                <p className="text-sm text-[rgba(238,234,228,0.45)] leading-relaxed mb-4 flex-1">
                  {card.situation}
                </p>
                <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
                  <p className="text-xs text-[rgba(238,234,228,0.3)] mb-2">{card.withMeetzy}</p>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-[#eeeae4]">{card.result}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
