"use client";

import { useRef, useState, useEffect } from "react";
import MiloAvatar from "./MiloAvatar";
import MiloChat from "./MiloChat";
import { type BehaviorTrackerResult } from "@/lib/behavior-tracker";

interface MiloDemoProps {
  tracker: BehaviorTrackerResult;
}

function buildDemoOpener(tracker: BehaviorTrackerResult): string {
  const ctx = tracker.context;
  if (ctx.isReturnVisitor) {
    return "Bienvenido de vuelta. Ya sé lo que estuviste mirando. ¿Empezamos?";
  }
  const pricingTime = ctx.sectionsViewed["pricing"]?.time ?? 0;
  const featuresTime = ctx.sectionsViewed["features"]?.time ?? 0;
  if (pricingTime > 20) {
    return `Vi que pasaste ${Math.round(pricingTime)}s mirando los planes. ¿Querés que te cuente cuál tiene más sentido para tu negocio?`;
  }
  if (featuresTime > 30) {
    return "Vi que prestaste atención a cómo funciona el tracking. ¿Querés probarlo en tu negocio?";
  }
  if (ctx.timeOnSite > 60) {
    return `Llevás ${Math.round(ctx.timeOnSite / 60)} minuto${ctx.timeOnSite > 120 ? "s" : ""} explorando. ¿Puedo ayudarte a decidir?`;
  }
  if (ctx.localHour >= 22 || ctx.localHour < 6) {
    return "Hola. Es tarde. ¿Qué necesitás saber para decidir hoy?";
  }
  return "Hola, soy Milo. Ya sé lo que estuviste mirando en esta página. Probame — preguntame lo que quieras.";
}

// Floating particles
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-accent/20"
          style={{
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float-particle ${4 + Math.random() * 6}s ease-in-out ${Math.random() * 4}s infinite`,
            opacity: 0.3 + Math.random() * 0.4,
          }}
        />
      ))}
      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          33%       { transform: translateY(-20px) translateX(8px); opacity: 0.7; }
          66%       { transform: translateY(-10px) translateX(-5px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default function MiloDemo({ tracker }: MiloDemoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [started, setStarted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const openerRef = useRef<string>("");

  useEffect(() => {
    openerRef.current = buildDemoOpener(tracker);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-open when section scrolls into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started) {
          setTimeout(() => setStarted(true), 600);
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  return (
    <section
      id="demo"
      data-section="demo"
      ref={sectionRef}
      className="py-28 relative overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.05)] to-transparent" />
      {/* Deep glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)",
        }}
      />
      <Particles />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs text-accent/70 uppercase tracking-widest font-medium mb-4">
            Demo en vivo
          </p>
          <h2
            className="font-syne font-black text-[#eeeae4] leading-[0.9] mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", letterSpacing: "-0.03em" }}
          >
            Hablale. Ya sabe<br />lo que estuviste mirando.
          </h2>
          <p className="text-[rgba(238,234,228,0.4)] font-light text-lg">
            Esto es exactamente lo que tus visitantes van a vivir en tu web.
          </p>
        </div>

        {/* Main demo layout */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-12">
          {/* Milo */}
          <div
            ref={containerRef}
            className="flex flex-col items-center gap-4 flex-shrink-0"
          >
            <div className="relative">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 55% 65% at 50% 40%, rgba(99,102,241,0.2) 0%, transparent 70%)",
                  transform: "scale(1.5)",
                }}
              />
              <MiloAvatar
                size={320}
                isSpeaking={isSpeaking}
                mousePosition={tracker.mousePosition}
                containerRef={containerRef}
                className="relative z-10 milo-glow"
              />
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-[#0e0e12] border border-[rgba(255,255,255,0.07)] rounded-full">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isSpeaking ? "bg-accent animate-pulse" : "bg-green-500"
                }`}
              />
              <span className="text-xs text-[rgba(238,234,228,0.4)]">
                {isSpeaking ? "Milo está respondiendo…" : "Milo · observando esta página"}
              </span>
            </div>

            {/* Context badge */}
            {tracker.context.inferredIntent !== "exploring" && (
              <div className="px-3 py-1.5 bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.2)] rounded-full">
                <span className="text-[10px] font-mono text-accent/70">
                  intent: {tracker.context.inferredIntent}
                </span>
              </div>
            )}
          </div>

          {/* Chat panel */}
          <div
            className="w-full max-w-[400px] lg:w-[400px] flex-shrink-0"
            style={{ height: 480 }}
          >
            {started ? (
              <MiloChat
                initialMessage={openerRef.current || buildDemoOpener(tracker)}
                context={tracker.context}
                onSpeakingChange={setIsSpeaking}
              />
            ) : (
              <div className="h-full card flex items-center justify-center">
                <div className="text-center">
                  <div className="flex gap-1.5 justify-center mb-3">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-2 h-2 rounded-full bg-accent/40"
                        style={{ animation: `bounce-dot 1.2s ease ${d}ms infinite` }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[rgba(238,234,228,0.3)]">Milo está observando…</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[rgba(238,234,228,0.2)] mt-10">
          Milo usa el contexto real de lo que hiciste en esta página
        </p>
      </div>

      <style>{`
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-6px); }
        }
      `}</style>
    </section>
  );
}
