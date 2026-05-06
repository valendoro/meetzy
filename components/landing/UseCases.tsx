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
    <section data-section="use-cases" className="py-28 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.05)] to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal className="text-center mb-14">
          <p className="text-xs text-accent/70 uppercase tracking-widest font-medium mb-4">
            Para quién
          </p>
          <h2
            className="font-syne font-black text-[#eeeae4] leading-[0.9]"
            style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", letterSpacing: "-0.03em" }}
          >
            Un agente que entiende<br />cualquier negocio.
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-[220px_1fr] gap-6">
          <div className="space-y-1.5">
            {CASES.map((cas, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                  active === i
                    ? "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] text-[#eeeae4]"
                    : "border-transparent text-[rgba(238,234,228,0.35)] hover:text-[rgba(238,234,228,0.65)] hover:border-[rgba(255,255,255,0.05)]"
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
                <p className="font-syne font-bold text-xl text-[#eeeae4] mb-1">{c.label}</p>
                <p className="text-sm text-[rgba(238,234,228,0.4)]">Lo que Meetzy hace:</p>
                <p className="text-base text-[rgba(238,234,228,0.8)] mt-1 leading-relaxed">{c.what}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-[#0a0a0d] border border-[rgba(255,255,255,0.05)] rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-[rgba(238,234,228,0.2)] font-medium mb-2">Sin Meetzy</p>
                <p className="text-sm text-[rgba(238,234,228,0.3)]">{c.without}</p>
              </div>
              <div className="rounded-xl p-4 border" style={{ background: `${c.color}08`, borderColor: `${c.color}22` }}>
                <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: `${c.color}aa` }}>Con Meetzy</p>
                <p className="text-sm font-medium" style={{ color: c.color }}>{c.result}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
