import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    tagline: "Para entender a tu visitante",
    features: [
      "Agente que aprende tu negocio solo",
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
  {
    q: "¿Necesito saber programar?",
    a: "No. Pegás tu URL, configurás el avatar en 5 minutos, copiás una línea. Si usás Webflow, WordPress o Shopify, hay integración directa.",
  },
  {
    q: "¿Cómo aprende mi negocio?",
    a: "Pegás la URL y Meetzy analiza todo: productos, precios, horarios, servicios, tono. También podés agregar info manualmente.",
  },
  {
    q: "¿El tracking no es invasivo para mis visitantes?",
    a: "Meetzy trackea comportamiento anónimo de navegación — igual que Google Analytics. Sin datos personales sin consentimiento.",
  },
  {
    q: "¿Qué pasa si el agente no sabe responder algo?",
    a: "Lo reconoce y puede derivar a WhatsApp, email o llamada. Nunca inventa información.",
  },
  {
    q: "¿El avatar se puede personalizar?",
    a: "Completamente. Tipo, colores, logo. La naranja de tu frutería. La chomba con tu logo. Lo que represente tu negocio.",
  },
];

export default function Pricing() {
  return (
    <>
      {/* Pricing */}
      <section id="precios" data-section="pricing" className="py-28 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.05)] to-transparent" />

        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-xs text-accent/70 uppercase tracking-widest font-medium mb-4">Precios</p>
            <h2
              className="font-syne font-black text-[#eeeae4] leading-[0.9] mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", letterSpacing: "-0.03em" }}
            >
              Simple. Sin sorpresas.
            </h2>
            <p className="text-[rgba(238,234,228,0.4)] font-light text-lg">
              Sin comisiones por conversación. Cancelás cuando querés.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {PLANS.map((plan, i) => (
              <ScrollReveal key={plan.id} className={`reveal-d${i + 1}`}>
                <div
                  className={`relative h-full flex flex-col rounded-2xl p-7 border transition-all duration-200 ${
                    plan.highlighted
                      ? "bg-[rgba(99,102,241,0.07)] border-[rgba(99,102,241,0.3)] shadow-[0_0_60px_rgba(99,102,241,0.08)]"
                      : "bg-[#0e0e12] border-[rgba(255,255,255,0.06)]"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-accent text-white text-[10px] font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <p className="text-[10px] uppercase tracking-widest text-[rgba(238,234,228,0.3)] font-medium mb-2">
                      {plan.name}
                    </p>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="font-syne font-black text-4xl text-[#eeeae4]">{plan.price}</span>
                      <span className="text-[rgba(238,234,228,0.3)] text-sm">/mes</span>
                    </div>
                    <p className="text-sm text-[rgba(238,234,228,0.4)]">{plan.tagline}</p>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-7">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <svg className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[rgba(238,234,228,0.5)]">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`block w-full text-center font-medium py-3 rounded-xl text-sm transition-all duration-150 ${
                      plan.highlighted
                        ? "bg-accent hover:bg-[#4f46e5] text-white"
                        : "border border-[rgba(255,255,255,0.09)] text-[rgba(238,234,228,0.6)] hover:border-[rgba(255,255,255,0.18)] hover:text-[#eeeae4]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <p className="text-center text-xs text-[rgba(238,234,228,0.2)] mt-8">
            Sin tarjeta para empezar · Cancelás cuando querés · 10 minutos de setup
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-28 relative">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal className="text-center mb-12">
            <h2
              className="font-syne font-black text-[#eeeae4] tracking-[-0.03em]"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
            >
              Preguntas frecuentes
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {FAQ.map((item, i) => (
              <ScrollReveal key={i} className={`reveal-d${(i % 2) + 1}`}>
                <div className="card p-6">
                  <p className="font-syne font-bold text-[#eeeae4] text-base mb-2">{item.q}</p>
                  <p className="text-sm text-[rgba(238,234,228,0.4)] leading-relaxed">{item.a}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <div className="relative rounded-3xl bg-[#0e0e12] border border-[rgba(255,255,255,0.06)] p-14 md:p-24 text-center overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 100%)",
                }}
              />
              <div className="relative">
                <h2
                  className="font-syne font-black text-[#eeeae4] leading-[0.88] mb-3"
                  style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)", letterSpacing: "-0.04em" }}
                >
                  Tu web siempre<br />
                  estuvo muda.
                </h2>
                <p
                  className="font-syne font-black leading-[0.88] mb-8"
                  style={{
                    fontSize: "clamp(2.2rem, 6vw, 5rem)",
                    letterSpacing: "-0.04em",
                    color: "rgba(238,234,228,0.25)",
                  }}
                >
                  Ya no tiene que serlo.
                </p>
                <p className="text-[rgba(238,234,228,0.4)] text-lg font-light mb-10 max-w-xl mx-auto">
                  Meetzy le da a tu web la capacidad de entender, responder y conectar con cada persona que entra.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/dashboard/new"
                    className="inline-flex items-center gap-2 bg-accent hover:bg-[#4f46e5] text-white font-medium px-8 py-4 rounded-xl transition-colors text-base"
                  >
                    Crear mi agente gratis
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                  <Link
                    href="#precios"
                    className="inline-flex items-center border border-[rgba(255,255,255,0.09)] text-[rgba(238,234,228,0.55)] font-medium px-8 py-4 rounded-xl hover:border-[rgba(255,255,255,0.18)] hover:text-[#eeeae4] transition-all text-base"
                  >
                    Ver los planes
                  </Link>
                </div>
                <p className="text-xs text-[rgba(238,234,228,0.18)] mt-6">
                  Sin tarjeta · Sin código · Sin contratos · 10 minutos
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.05)] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-syne font-black text-lg text-[#eeeae4]">
              MEET<span className="text-accent">ZY</span>
            </p>
            <p className="text-xs text-[rgba(238,234,228,0.2)] mt-0.5">La web que entiende.</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-[rgba(238,234,228,0.3)]">
            {[["Precios", "#precios"], ["Privacidad", "#"], ["Términos", "#"], ["Contacto", "/auth/signin"]].map(
              ([l, h]) => (
                <a key={l} href={h} className="hover:text-[rgba(238,234,228,0.7)] transition-colors">
                  {l}
                </a>
              )
            )}
          </div>
          <p className="text-xs text-[rgba(238,234,228,0.2)]">© 2026 Meetzy.</p>
        </div>
      </footer>
    </>
  );
}
