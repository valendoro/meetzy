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

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1200;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{value.toLocaleString("es-AR")}{suffix}</span>;
}

function Stats() {
  const STATS = [
    { label: "agentes activos", target: 1200, suffix: "+" },
    { label: "conversaciones", target: 4.8, suffix: "M", isDecimal: true },
    { label: "satisfacción", target: 94, suffix: "%" },
    { label: "minutos de setup", target: 10, suffix: "" },
  ];

  return (
    <section className="py-16" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="animate-count-up">
              <p className="font-syne font-black text-[#eeeae4] mb-1.5"
                style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "-0.035em" }}>
                {s.isDecimal ? `${s.target}${s.suffix}` : <CountUp target={s.target} suffix={s.suffix} />}
              </p>
              <p className="text-sm" style={{ color: "rgba(238,234,228,0.35)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-[#060608]">
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
