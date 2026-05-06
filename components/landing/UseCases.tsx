"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

const CASES = [
  {
    icon: "🐾",
    label: "Veterinaria",
    color: "#2563eb",
    avatarEmoji: "🐶",
    what: "Agenda urgencias a las 11pm. Calma a dueños preocupados. Explica tratamientos sin que esperen.",
    without: "Horario de atención en el footer.",
    result: "Turno agendado, dueño tranquilo.",
  },
  {
    icon: "👕",
    label: "Marca de ropa",
    color: "#e11d48",
    avatarEmoji: "👗",
    what: "Recomienda talles. Muestra stock. Procesa dudas sobre materiales y cuidados.",
    without: "Página de producto sin respuestas.",
    result: "Compra completada.",
  },
  {
    icon: "🍊",
    label: "Frutería",
    color: "#f97316",
    avatarEmoji: "🛒",
    what: "Toma pedidos de cajones. Informa precios de temporada. Agenda delivery.",
    without: "WhatsApp que nadie responde.",
    result: "Pedido tomado en 2 minutos.",
  },
  {
    icon: "⚖️",
    label: "Estudio jurídico",
    color: "#7c3aed",
    avatarEmoji: "📋",
    what: "Escucha el problema. Identifica el área legal. Deriva al abogado correcto con contexto.",
    without: "Formulario genérico de contacto.",
    result: "Consulta agendada con contexto.",
  },
  {
    icon: "🏠",
    label: "Inmobiliaria",
    color: "#059669",
    avatarEmoji: "🔑",
    what: "Infiere el perfil del comprador. Filtra propiedades. Agenda visitas al instante.",
    without: "Grilla de propiedades infinita.",
    result: "Visita agendada en 5 minutos.",
  },
  {
    icon: "🎓",
    label: "Instituto",
    color: "#0891b2",
    avatarEmoji: "📚",
    what: "Explica programas. Responde dudas de inscripción. Agenda entrevistas con padres.",
    without: "PDF del programa.",
    result: "Inscripción iniciada.",
  },
];

export default function UseCases() {
  const [active, setActive] = useState(0);
  const c = CASES[active]!;

  return (
    <section id="para-quien" data-section="use-cases" className="section-y relative">
      <div className="section-divider-top" />

      <div className="wrap">
        <ScrollReveal className="text-center mb-14">
          <p className="kicker kicker-accent">Para quién</p>
          <h2 className="display display-lg">
            Un agente que entiende<br />cualquier negocio.
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-[220px_1fr] gap-6">
          <div className="space-y-1.5">
            {CASES.map((cas, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                  active === i
                    ? "border-[var(--c-border2)] bg-[rgba(255,255,255,0.04)] text-[var(--c-text)]"
                    : "border-transparent text-[var(--c-muted)] hover:text-[var(--c-text)] hover:border-[var(--c-border)]"
                }`}
              >
                <span className="text-lg">{cas.icon}</span>
                <span className="text-sm font-medium">{cas.label}</span>
              </button>
            ))}
          </div>

          <div className="card p-8" key={active}>
            <div className="flex items-start gap-5 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: `${c.color}12`, border: `1px solid ${c.color}25` }}
              >
                {c.avatarEmoji}
              </div>
              <div>
                <p className="font-syne font-bold text-xl text-text mb-1">{c.label}</p>
                <p className="text-sm text-muted">Lo que Meetzy hace:</p>
                <p className="text-base text-[var(--c-text)] mt-1 leading-relaxed opacity-90">{c.what}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-bg border border-border rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-[var(--c-muted2)] font-medium mb-2">Sin Meetzy</p>
                <p className="text-sm text-muted">{c.without}</p>
              </div>
              <div className="rounded-xl p-4 border" style={{ background: `${c.color}08`, borderColor: `${c.color}22` }}>
                <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: `${c.color}aa` }}>Con Meetzy</p>
                <p className="text-sm font-medium" style={{ color: c.color }}>{c.result}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted mt-12 max-w-2xl mx-auto leading-relaxed opacity-80">
          Plan Pro: elegís el tipo y aplicamos tu marca.
          Plan Elite: el personaje habla con voz real y lip sync.
        </p>
      </div>
    </section>
  );
}
