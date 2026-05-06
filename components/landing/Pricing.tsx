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
    cta: "Hablar con el equipo", href: "/auth/signin", highlighted: false,
  },
];

const FAQ = [
  { q: "¿Necesito saber programar?", a: "No. Pegás tu URL, configurás el avatar en 5 minutos, copiás una línea. Si usás Webflow, WordPress o Shopify, hay integración directa." },
  { q: "¿Cómo aprende mi negocio?", a: "Pegás la URL y Meetzy analiza todo automáticamente: productos, precios, horarios, servicios, tono." },
  { q: "¿El tracking no es invasivo?", a: "Trackea comportamiento anónimo de navegación — igual que Google Analytics. Sin datos personales sin consentimiento." },
  { q: "¿Qué pasa si no sabe responder algo?", a: "Lo reconoce y puede derivar a WhatsApp, email o llamada. Nunca inventa información." },
  { q: "¿El avatar se puede personalizar?", a: "Completamente. Tipo, colores, logo. La naranja de tu frutería. La chomba con tu logo." },
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
                <div style={{
                  position: "relative", borderRadius: 20, padding: plan.highlighted ? "2rem" : "1.75rem",
                  display: "flex", flexDirection: "column",
                  ...(plan.highlighted ? {
                    background: "rgba(124,108,255,0.09)",
                    border: "1px solid rgba(124,108,255,0.38)",
                    boxShadow: "0 0 60px rgba(124,108,255,0.12), 0 24px 60px rgba(0,0,0,0.35)",
                    transform: "scale(1.02)",
                  } : {
                    background: "var(--c-surface)",
                    border: "1px solid var(--c-border)",
                  }),
                }}>
                  {plan.badge && (
                    <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)" }}>
                      <span style={{
                        background: "var(--c-accent)", color: "#fff", fontSize: "0.68rem",
                        fontWeight: 700, padding: "4px 12px", borderRadius: 100, letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}>{plan.badge}</span>
                    </div>
                  )}

                  <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12,
                    color: plan.highlighted ? "rgba(183,176,255,0.92)" : "var(--c-muted2)" }}>{plan.name}</p>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                    <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: plan.highlighted ? "2.8rem" : "2.4rem", letterSpacing: "-0.04em", color: "var(--c-text)" }}>
                      {plan.price}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--c-muted2)" }}>/mes</span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--c-muted)", marginBottom: 24 }}>{plan.tagline}</p>

                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, flex: 1, marginBottom: 24 }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.85rem" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2, color: plan.highlighted ? "var(--c-warm)" : "var(--c-accent)" }}>
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ color: "var(--c-muted)" }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href} style={{
                    display: "block", textAlign: "center", fontWeight: 600, fontSize: "0.875rem",
                    padding: "12px", borderRadius: 12, textDecoration: "none", transition: "all 0.15s ease",
                    ...(plan.highlighted ? {
                      background: "var(--c-accent)",
                      color: "#fff",
                      boxShadow: "0 0 28px rgba(124,108,255,0.4)",
                    } : {
                      border: "1px solid var(--c-border2)",
                      color: "var(--c-muted)",
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

        <style>{`@media (min-width: 768px) { .pricing-grid { grid-template-columns: repeat(3, 1fr) !important; } }`}</style>
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
              position: "relative", borderRadius: 28, padding: "80px 48px", textAlign: "center", overflow: "hidden",
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
      <footer style={{ borderTop: "1px solid var(--c-border)", padding: "40px 0" }}>
        <div className="wrap" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div>
            <Link href="/" className="logo-mark" style={{ fontSize: "1.1rem" }}>
              MEET<span>ZY</span>
            </Link>
            <p style={{ fontSize: "0.78rem", color: "var(--c-muted2)", marginTop: 4 }}>La web que entiende.</p>
          </div>
          <div style={{ display: "flex", gap: 28 }}>
            {[["Precios", "#precios"], ["Privacidad", "#"], ["Términos", "#"], ["Contacto", "/auth/signin"]].map(([l, h]) => (
              <a key={l} href={h} style={{ fontSize: "0.82rem", color: "var(--c-muted2)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--c-text)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--c-muted2)"}>{l}</a>
            ))}
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--c-muted2)" }}>© 2026 Meetzy.</p>
        </div>
      </footer>
    </>
  );
}
