"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Problem from "@/components/landing/Problem";
import Features from "@/components/landing/Features";
import UseCases from "@/components/landing/UseCases";
import AvatarShowcase from "@/components/landing/AvatarShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import LandingOrchestrator from "@/components/landing/LandingOrchestrator";
import WidgetDemo from "@/components/landing/WidgetDemo";
import Testimonials from "@/components/landing/Testimonials";
import TrustStrip from "@/components/landing/TrustStrip";
// WidgetDemo loads the real Milo widget — this IS the demo

/* ── Count-up number ─────────────────────────────────────── */
function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !started.current) {
        started.current = true;
        const dur = 1400;
        const t0 = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(eased * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);

  return <span ref={ref}>{val.toLocaleString("es-AR")}{suffix}</span>;
}

/* ── Stats bar ──────────────────────────────────────────── */
function Stats() {
  return (
    <section className="stats-strip" aria-label="Indicadores">
      <div className="wrap">
        <div className="stats-grid-desktop">
        {[
          { end: 1200, suffix: "+", label: "agentes activos" },
          { end: 4, suffix: ".8M", label: "conversaciones" },
          { end: 94, suffix: "%", label: "satisfacción" },
          { end: 10, suffix: " min", label: "de setup" },
        ].map((s) => (
          <div key={s.label} className="stat-cell">
            <div className="stat-value">
              <CountUp end={s.end} suffix={s.suffix} />
            </div>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}

/* ── Mid-funnel CTA strip ────────────────────────────────── */
function MidFunnelCTA() {
  return (
    <section className="section-y" style={{ paddingTop: "calc(var(--section-y) * 0.65)", paddingBottom: "calc(var(--section-y) * 0.65)" }}>
      <div className="wrap">
        <div style={{
          borderRadius: "var(--radius-xl)",
          padding: "clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 5vw, 3rem)",
          background: "linear-gradient(135deg, rgba(124,108,255,0.1) 0%, rgba(22,21,31,0.95) 50%, rgba(232,160,144,0.07) 100%)",
          border: "1px solid rgba(124,108,255,0.22)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset",
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
          gap: "2rem",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--c-green)", boxShadow: "0 0 10px rgba(61,214,143,0.7)", animation: "glow-pulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-green)" }}>
                Agentes activos ahora
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", letterSpacing: "-0.03em", color: "var(--c-text)", lineHeight: 1.1, marginBottom: 10 }}>
              Tu próximo visitante llega<br />en los próximos minutos.
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--c-muted)", maxWidth: 400, lineHeight: 1.6 }}>
              ¿Va a encontrarse con una web muda o con un agente que ya sabe qué necesita?
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
            <a href="/dashboard/new" className="btn-primary" style={{ padding: "13px 28px", fontSize: "0.9375rem", whiteSpace: "nowrap" }}>
              Crear mi agente gratis
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <p style={{ fontSize: "0.72rem", color: "var(--c-muted2)", paddingLeft: 2 }}>Sin tarjeta · 10 minutos · Sin código</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main className="relative z-[1] min-h-screen w-full">
      <Navbar />
      <LandingOrchestrator />
      <WidgetDemo />
      <Stats />
      <Problem />
      <Testimonials />
      <TrustStrip />
      <Features />
      <UseCases />
      <AvatarShowcase />
      <HowItWorks />
      <MidFunnelCTA />
      <Pricing />
    </main>
  );
}
