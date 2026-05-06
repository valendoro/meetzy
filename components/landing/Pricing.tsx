"use client";

import Link from "next/link";
import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    tagline: "Para entender a tu visitante",
    features: [
      "Agente aprende tu negocio solo",
      "Behavioral tracking completo",
      "Inicia conversaciones con contexto",
      "Chat texto · 1 sitio · 500 conversaciones",
    ],
    cta: "Empezar gratis",
    href: "/dashboard/new?plan=starter",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    badge: "El más elegido",
    price: "$79",
    tagline: "Para que tu marca esté viva",
    features: [
      "Todo lo de Starter +",
      "Avatar animado con tu identidad",
      "Tu logo, tus colores, tu personaje",
      "UI dinámica en tiempo real",
      "3 sitios · 2.000 conversaciones",
    ],
    cta: "Empezar con Pro",
    href: "/dashboard/new?plan=pro",
    highlighted: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: "$199",
    tagline: "La experiencia completa",
    features: [
      "Todo lo de Pro +",
      "El avatar habla con voz real",
      "Lip sync en tiempo real",
      "Agenda reuniones solo",
      "CRM automático",
      "Sitios y conversaciones ilimitados",
      'Sin "Powered by Meetzy"',
    ],
    cta: "Hablar con el equipo",
    href: "/auth/signin",
    highlighted: false,
  },
];

const FAQ = [
  { q: "¿Necesito saber programar?", a: "No. Pegás tu URL, configurás el avatar en 5 minutos, copiás una línea. Si usás Webflow, WordPress o Shopify, hay integración directa." },
  { q: "¿Cómo aprende mi negocio?", a: "Pegás la URL y Meetzy analiza todo automáticamente: productos, precios, horarios, servicios, tono." },
  { q: "¿El tracking no es invasivo?", a: "Meetzy trackea comportamiento anónimo de navegación — igual que Google Analytics. Sin datos personales sin consentimiento." },
  { q: "¿Qué pasa si no sabe responder algo?", a: "Lo reconoce y puede derivar a WhatsApp, email o llamada. Nunca inventa información." },
  { q: "¿El avatar se puede personalizar?", a: "Completamente. Tipo, colores, logo. La naranja de tu frutería. La chomba con tu logo. Lo que represente tu negocio." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left p-6 rounded-2xl transition-all duration-200"
      style={{
        background: open ? "rgba(16,16,22,0.9)" : "rgba(14,14,20,0.6)",
        border: `1px solid ${open ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.07)"}`,
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="font-syne font-bold text-[#eeeae4] text-sm text-left">{q}</p>
        <svg
          className="flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", opacity: 0.5 }}
          width="16" height="16" viewBox="0 0 24 24" fill="none"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {open && (
        <p className="mt-3 text-sm leading-relaxed text-left" style={{ color: "rgba(238,234,228,0.45)" }}>
          {a}
        </p>
      )}
    </button>
  );
}

export default function Pricing() {
  return (
    <>
      {/* Pricing */}
      <section id="precios" data-section="pricing" className="py-28 relative">
        <div className="section-divider absolute top-0 inset-x-0" />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 80%, rgba(99,102,241,0.04) 0%, transparent 100%)"
        }} />

        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal className="text-center mb-16">
            <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: "rgba(99,102,241,0.75)" }}>Precios</p>
            <h2 className="font-syne font-black text-[#eeeae4] leading-[0.9] mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", letterSpacing: "-0.035em" }}>
              Simple. Sin sorpresas.
            </h2>
            <p style={{ color: "rgba(238,234,228,0.4)", fontSize: "1.1rem", fontWeight: 300 }}>
              Sin comisiones por conversación. Cancelás cuando querés.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto items-start">
            {PLANS.map((plan, i) => (
              <ScrollReveal key={plan.id} className={`reveal-d${i + 1}`}>
                <div
                  className="relative flex flex-col rounded-2xl"
                  style={plan.highlighted ? {
                    background: "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.45)",
                    boxShadow: "0 0 60px rgba(99,102,241,0.15), 0 24px 60px rgba(0,0,0,0.35)",
                    transform: "scale(1.03)",
                    padding: "2rem",
                  } : {
                    background: "rgba(14,14,20,0.8)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "1.75rem",
                  }}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide uppercase">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <p className="text-[10px] uppercase tracking-widest font-medium mb-2"
                      style={{ color: plan.highlighted ? "rgba(99,102,241,0.8)" : "rgba(238,234,228,0.3)" }}>
                      {plan.name}
                    </p>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="font-syne font-black text-[#eeeae4]"
                        style={{ fontSize: plan.highlighted ? "2.8rem" : "2.4rem" }}>
                        {plan.price}
                      </span>
                      <span className="text-sm" style={{ color: "rgba(238,234,228,0.3)" }}>/mes</span>
                    </div>
                    <p className="text-sm" style={{ color: "rgba(238,234,228,0.42)" }}>{plan.tagline}</p>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-7">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none"
                          style={{ color: plan.highlighted ? "#818cf8" : "#6366f1" }}>
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ color: "rgba(238,234,228,0.55)" }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className="block w-full text-center font-semibold py-3 rounded-xl text-sm transition-all duration-150"
                    style={plan.highlighted ? {
                      background: "#6366f1",
                      color: "#fff",
                      boxShadow: "0 0 20px rgba(99,102,241,0.4)",
                    } : {
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(238,234,228,0.6)",
                    }}
                    onMouseEnter={e => {
                      if (!plan.highlighted) {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
                        (e.currentTarget as HTMLElement).style.color = "#eeeae4";
                      } else {
                        (e.currentTarget as HTMLElement).style.background = "#4f46e5";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!plan.highlighted) {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                        (e.currentTarget as HTMLElement).style.color = "rgba(238,234,228,0.6)";
                      } else {
                        (e.currentTarget as HTMLElement).style.background = "#6366f1";
                      }
                    }}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <p className="text-center mt-8 text-xs" style={{ color: "rgba(238,234,228,0.2)" }}>
            Sin tarjeta para empezar · Cancelás cuando querés · 10 minutos de setup
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-syne font-black text-[#eeeae4]"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.03em" }}>
              Preguntas frecuentes
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-3 max-w-4xl mx-auto">
            {FAQ.map((item, i) => (
              <ScrollReveal key={i} className={`reveal-d${(i % 2) + 1}`}>
                <FaqItem q={item.q} a={item.a} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <div className="relative rounded-3xl p-14 md:p-24 text-center overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(14,14,20,0.95) 0%, rgba(16,14,28,0.95) 100%)",
                border: "1px solid rgba(99,102,241,0.15)",
                boxShadow: "0 40px 100px rgba(0,0,0,0.5), inset 0 0 60px rgba(99,102,241,0.04)",
              }}>
              <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 100%)"
              }} />

              <div className="relative">
                <h2 className="font-syne font-black text-[#eeeae4] leading-[0.88] mb-3"
                  style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)", letterSpacing: "-0.045em" }}>
                  Tu web siempre<br />estuvo muda.
                </h2>
                <p className="font-syne font-black leading-[0.88] mb-8"
                  style={{
                    fontSize: "clamp(2.2rem, 6vw, 5rem)",
                    letterSpacing: "-0.045em",
                    color: "rgba(238,234,228,0.2)",
                  }}>
                  Ya no tiene que serlo.
                </p>
                <p className="font-light mb-10 mx-auto max-w-xl"
                  style={{ color: "rgba(238,234,228,0.4)", fontSize: "1.1rem" }}>
                  Meetzy le da a tu web la capacidad de entender, responder y conectar.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/dashboard/new"
                    className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl transition-all text-base"
                    style={{
                      background: "#6366f1",
                      boxShadow: "0 0 40px rgba(99,102,241,0.4)",
                    }}
                  >
                    Crear mi agente gratis
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                  <Link
                    href="#precios"
                    className="inline-flex items-center font-medium px-8 py-4 rounded-xl transition-all text-base"
                    style={{
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(238,234,228,0.55)",
                    }}
                  >
                    Ver los planes
                  </Link>
                </div>
                <p className="text-xs mt-6" style={{ color: "rgba(238,234,228,0.18)" }}>
                  Sin tarjeta · Sin código · Sin contratos · 10 minutos
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} className="py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-syne font-black text-lg text-[#eeeae4]">
              MEET<span className="text-accent">ZY</span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(238,234,228,0.2)" }}>La web que entiende.</p>
          </div>
          <div className="flex items-center gap-6 text-xs" style={{ color: "rgba(238,234,228,0.3)" }}>
            {[["Precios", "#precios"], ["Privacidad", "#"], ["Términos", "#"], ["Contacto", "/auth/signin"]].map(([l, h]) => (
              <a key={l} href={h} className="hover:text-[#eeeae4] transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-xs" style={{ color: "rgba(238,234,228,0.2)" }}>© 2026 Meetzy.</p>
        </div>
      </footer>
    </>
  );
}
