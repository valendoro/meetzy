"use client";

import Link from "next/link";
import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

const PLANS = [
  {
    id: "starter", name: "Starter", price: "$29",
    tagline: "Para entender a tu visitante",
    features: ["Agente que aprende tu negocio solo", "Behavioral tracking completo", "Inicia conversaciones con contexto", "Chat texto · 1 sitio · 500 conv/mes"],
    cta: "Empezar gratis", href: "/dashboard/new?plan=starter", highlighted: false,
  },
  {
    id: "pro", name: "Pro", price: "$79", badge: "El más elegido",
    tagline: "Para que tu marca esté viva",
    features: ["Todo lo de Starter +", "Avatar animado con tu identidad", "Tu logo, tus colores, tu personaje", "UI dinámica en tiempo real", "3 sitios · 2.000 conv/mes"],
    cta: "Empezar con Pro", href: "/dashboard/new?plan=pro", highlighted: true,
  },
  {
    id: "elite", name: "Elite", price: "$199",
    tagline: "La experiencia completa",
    features: ["Todo lo de Pro +", "El avatar habla con voz real", "Lip sync en tiempo real", "Agenda reuniones solo", "CRM automático", "Ilimitado · Sin branding"],
    cta: "Hablar con el equipo", href: "mailto:hola@meetzy.io?subject=Plan%20Elite", highlighted: false,
  },
];

const FAQ = [
  { q: "¿Necesito saber programar?", a: "No. Pegás tu URL, configurás el avatar en 5 minutos, copiás una línea. Si usás Webflow, WordPress o Shopify, hay integración directa." },
  { q: "¿Cómo aprende mi negocio?", a: "Pegás la URL y Meetzy analiza todo automáticamente: productos, precios, horarios, servicios, tono." },
  { q: "¿El tracking no es invasivo?", a: "Trackea comportamiento anónimo de navegación — igual que Google Analytics. Sin datos personales sin consentimiento." },
  { q: "¿Qué pasa si no sabe responder algo?", a: "Lo reconoce y puede derivar a WhatsApp, email o llamada. Nunca inventa información." },
  { q: "¿El avatar se puede personalizar?", a: "Completamente. Colores, logo, nombre. La naranja de tu frutería. La chomba con tu logo." },
  { q: "¿Puedo probarlo antes de pagar?", a: "Sí. El plan Starter es gratis para siempre. Sin tarjeta de crédito. Entrás, creás tu agente y lo probás en vivo." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      style={{
        width: "100%", textAlign: "left", padding: "20px 24px",
        borderRadius: 16, border: `1px solid ${open ? "rgba(124,108,255,0.28)" : "var(--c-border)"}`,
        background: open ? "var(--c-surface2)" : "var(--c-surface)",
        transition: "all 0.2s ease", cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <span style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.9rem", color: "var(--c-text)" }}>{q}</span>
        <svg style={{ flexShrink: 0, opacity: 0.4, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}
          width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {open && <p style={{ marginTop: 12, fontSize: "0.85rem", lineHeight: 1.65, color: "var(--c-muted)" }}>{a}</p>}
    </button>
  );
}

export default function Pricing() {
  return (
    <>
      {/* ── Pricing ── */}
      <section id="precios" data-section="pricing" className="section-y relative">
        <div className="section-divider-top" />

        <div className="wrap">
          <ScrollReveal style={{ textAlign: "center", marginBottom: 64 }}>
            <p className="kicker kicker-accent">Precios</p>
            <h2 className="display display-lg" style={{ marginBottom: 12 }}>Simple. Sin sorpresas.</h2>
            <p style={{ fontSize: "1.1rem", fontWeight: 300, color: "var(--c-muted)" }}>
              Sin comisiones por conversación. Cancelás cuando querés.
            </p>
          </ScrollReveal>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, maxWidth: 900, margin: "0 auto", alignItems: "start" }} className="pricing-grid">
            {PLANS.map((plan, i) => (
              <ScrollReveal key={plan.id} className={`reveal-d${i + 1}`}>
                <div className={plan.highlighted ? "pricing-card-highlighted" : ""} style={{
                  position: "relative", borderRadius: 22, padding: plan.highlighted ? "2.25rem" : "1.75rem",
                  display: "flex", flexDirection: "column",
                  ...(plan.highlighted ? {
                    background: "linear-gradient(155deg, rgba(50,44,90,0.98) 0%, rgba(35,32,68,0.99) 50%, rgba(28,26,52,1) 100%)",
                    border: "1px solid rgba(124,108,255,0.45)",
                    boxShadow: "0 0 80px rgba(124,108,255,0.18), 0 32px 72px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset",
                  } : {
                    background: "linear-gradient(155deg, rgba(24,23,36,0.98) 0%, rgba(18,17,28,0.99) 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 4px 28px rgba(0,0,0,0.4)",
                  }),
                }}>
                  {plan.highlighted && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "22px 22px 0 0", background: "linear-gradient(90deg, #7c6cff, #e8a090, #7c6cff)" }} />
                  )}
                  {plan.badge && (
                    <div style={{ position: "absolute", top: -15, left: "50%", transform: "translateX(-50%)" }}>
                      <span style={{
                        background: "linear-gradient(135deg, #9083ff, #7c6cff)",
                        color: "#fff", fontSize: "0.68rem",
                        fontWeight: 800, padding: "5px 14px", borderRadius: 100, letterSpacing: "0.08em",
                        textTransform: "uppercase", whiteSpace: "nowrap",
                        boxShadow: "0 4px 16px rgba(124,108,255,0.5)",
                      }}>{plan.badge}</span>
                    </div>
                  )}

                  <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12,
                    color: plan.highlighted ? "rgba(183,176,255,0.9)" : "var(--c-muted2)" }}>{plan.name}</p>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                    <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: plan.highlighted ? "3rem" : "2.4rem", letterSpacing: "-0.045em", color: "var(--c-text)", lineHeight: 1 }}>
                      {plan.price}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--c-muted2)" }}>/mes</span>
                  </div>
                  <p style={{ fontSize: "0.84rem", color: "var(--c-muted)", marginBottom: 24, lineHeight: 1.5 }}>{plan.tagline}</p>

                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, flex: 1, marginBottom: 28 }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.845rem" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2, color: plan.highlighted ? "#e8a090" : "var(--c-accent)" }}>
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ color: plan.highlighted ? "rgba(243,241,236,0.78)" : "var(--c-muted)" }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href} style={{
                    display: "block", textAlign: "center", fontWeight: 700, fontSize: "0.875rem",
                    padding: "13px", borderRadius: 12, textDecoration: "none", transition: "all 0.18s ease",
                    ...(plan.highlighted ? {
                      background: "linear-gradient(135deg, #9083ff 0%, #7c6cff 50%, #6548f0 100%)",
                      color: "#fff",
                      boxShadow: "0 0 0 1px rgba(255,255,255,0.1) inset, 0 8px 32px rgba(124,108,255,0.55)",
                    } : {
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "var(--c-muted)",
                      background: "rgba(255,255,255,0.03)",
                    }),
                  }}>
                    {plan.cta}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 28, fontSize: "0.78rem", color: "var(--c-muted2)" }}>
            Sin tarjeta para empezar · Cancelás cuando querés · 10 minutos de setup
          </p>
        </div>

        <style>{`
          @media (min-width: 768px) {
            .pricing-grid { grid-template-columns: repeat(3, 1fr) !important; }
          }
          /* scale(1.03) on highlighted card breaks mobile single-col; only show on 3-col */
          .pricing-card-highlighted { transform: none !important; }
          @media (min-width: 768px) {
            .pricing-card-highlighted { transform: scale(1.03) !important; }
          }
        `}</style>
      </section>

      {/* ── FAQ ── */}
      <section className="section-y relative" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <ScrollReveal style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 className="display display-md">Preguntas frecuentes</h2>
          </ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, maxWidth: 800, margin: "0 auto" }} className="faq-grid">
            {FAQ.map((item, i) => (
              <ScrollReveal key={i} className={`reveal-d${(i % 2) + 1}`}>
                <FaqItem q={item.q} a={item.a} />
              </ScrollReveal>
            ))}
          </div>
        </div>
        <style>{`@media (min-width: 768px) { .faq-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
      </section>

      {/* ── CTA Final ── */}
      <section className="section-y relative" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <ScrollReveal>
            <div style={{
              position: "relative", borderRadius: "clamp(16px, 4vw, 28px)", padding: "clamp(2rem, 8vw, 5rem) clamp(1.25rem, 6vw, 3rem)", textAlign: "center", overflow: "hidden",
              background: "linear-gradient(135deg, var(--c-surface) 0%, var(--c-bg-subtle) 100%)",
              border: "1px solid rgba(124,108,255,0.2)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.5), inset 0 0 60px rgba(124,108,255,0.05)",
            }}>
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(124,108,255,0.09) 0%, rgba(232,160,144,0.04) 45%, transparent 100%)" }} />
              <div style={{ position: "relative" }}>
                <h2 className="display" style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)", letterSpacing: "-0.05em", lineHeight: 0.88, marginBottom: 12 }}>
                  Tu web siempre<br />estuvo muda.
                </h2>
                <h2 className="display" style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)", letterSpacing: "-0.05em", lineHeight: 0.88, color: "var(--c-muted2)", marginBottom: 32 }}>
                  Ya no tiene que serlo.
                </h2>
                <p style={{ fontSize: "1.1rem", fontWeight: 300, color: "var(--c-muted)", maxWidth: 480, margin: "0 auto 48px" }}>
                  Meetzy le da a tu web la capacidad de entender, responder y conectar.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
                  <Link href="/dashboard/new" className="btn-primary" style={{ padding: "14px 32px", fontSize: "1rem" }}>
                    Crear mi agente gratis
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                  <Link href="#precios" className="btn-ghost" style={{ padding: "14px 32px", fontSize: "1rem" }}>
                    Ver los planes
                  </Link>
                </div>
                <p style={{ marginTop: 24, fontSize: "0.78rem", color: "var(--c-muted2)" }}>
                  Sin tarjeta · Sin código · Sin contratos · 10 minutos
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid var(--c-border)", paddingTop: 56, paddingBottom: 40 }}>
        <div className="wrap">
          {/* Main row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 40, marginBottom: 48 }} className="footer-grid">
            {/* Brand col */}
            <div>
              <Link href="/" className="logo-mark" style={{ fontSize: "1.15rem" }}>
                MEET<span>ZY</span>
              </Link>
              <p style={{ fontSize: "0.85rem", color: "var(--c-muted)", marginTop: 10, lineHeight: 1.6, maxWidth: 240 }}>
                La primera web que realmente entiende a cada visitante.
              </p>
              {/* Social icons */}
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                {[
                  { label: "Twitter / X", href: "https://x.com/meetzyai", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                  { label: "LinkedIn", href: "https://linkedin.com/company/meetzy", path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
                  { label: "Instagram", href: "https://instagram.com/meetzyai", path: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z" },
                ].map(({ label, href, path }) => (
                  <a key={label} href={href} aria-label={label} style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "var(--c-surface2)", border: "1px solid var(--c-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--c-muted)", textDecoration: "none",
                    transition: "color 0.15s ease, border-color 0.15s ease, background 0.15s ease",
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--c-text)"; el.style.borderColor = "var(--c-border2)"; el.style.background = "var(--c-surface3)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--c-muted)"; el.style.borderColor = "var(--c-border)"; el.style.background = "var(--c-surface2)"; }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Links cols */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 32 }} className="footer-links-grid">
              <div>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-muted2)", marginBottom: 16 }}>Producto</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[["Cómo funciona", "#como-funciona"], ["Para quién", "#para-quien"], ["Precios", "#precios"], ["Demo", "#demo"]].map(([l, h]) => (
                    <a key={l} href={h} style={{ fontSize: "0.875rem", color: "var(--c-muted)", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--c-text)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--c-muted)"}>{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-muted2)", marginBottom: 16 }}>Legal</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[["Privacidad", "#"], ["Términos", "#"], ["Cookies", "#"], ["Contacto", "mailto:hola@meetzy.io"]].map(([l, h]) => (
                    <a key={l} href={h} style={{ fontSize: "0.875rem", color: "var(--c-muted)", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--c-text)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--c-muted)"}>{l}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)", marginBottom: 24 }} />
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <p style={{ fontSize: "0.78rem", color: "var(--c-muted2)" }}>© 2026 Meetzy. Todos los derechos reservados.</p>
            <p style={{ fontSize: "0.78rem", color: "var(--c-muted2)" }}>Hecho en Argentina 🇦🇷</p>
          </div>
        </div>

        <style>{`
          @media (min-width: 768px) {
            .footer-grid { grid-template-columns: 260px 1fr !important; }
            .footer-links-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
        `}</style>
      </footer>
    </>
  );
}
