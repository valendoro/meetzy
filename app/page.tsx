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

/* ── Page ────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main className="relative z-[1] min-h-screen w-full">
      <Navbar />
      <LandingOrchestrator />
      <WidgetDemo />
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
