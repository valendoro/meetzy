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
    <section style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "56px 0",
    }}>
      <div className="wrap">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "2rem",
          textAlign: "center",
        }} className="stats-grid">
          {[
            { end: 1200, suffix: "+", label: "agentes activos" },
            { end: 4, suffix: ".8M", label: "conversaciones" },
            { end: 94, suffix: "%", label: "satisfacción" },
            { end: 10, suffix: " min", label: "de setup" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 800,
                fontSize: "clamp(2rem, 5vw, 3rem)",
                letterSpacing: "-0.04em",
                color: "var(--c-text)",
                lineHeight: 1,
                marginBottom: 8,
              }}>
                <CountUp end={s.end} suffix={s.suffix} />
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--c-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (min-width: 640px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", width: "100%", backgroundColor: "var(--c-bg)" }}>
      <Navbar />
      <LandingOrchestrator />
      <Stats />
      <Problem />
      <Features />
      <UseCases />
      <AvatarShowcase />
      <HowItWorks />
      <Pricing />
    </main>
  );
}
