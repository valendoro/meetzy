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
  if (ctx.isReturnVisitor) return "Bienvenido de vuelta. ¿Seguís evaluando o ya tenés más claro lo que necesitás?";
  const pricingTime = ctx.sectionsViewed["pricing"]?.time ?? 0;
  if (pricingTime > 20) return `Vi que pasaste ${Math.round(pricingTime)}s mirando los planes. ¿Querés que te cuente cuál tiene más sentido para tu negocio?`;
  if ((ctx.sectionsViewed["features"]?.time ?? 0) > 30) return "Vi que leíste sobre el behavioral tracking. ¿Querés probarlo en tu negocio?";
  if (ctx.timeOnSite > 60) return `Llevás ${Math.round(ctx.timeOnSite / 60)} minuto${ctx.timeOnSite > 120 ? "s" : ""} explorando. ¿Puedo ayudarte a decidir?`;
  if (ctx.localHour >= 22 || ctx.localHour < 6) return "Hola. Es tarde. ¿Qué necesitás saber para decidir hoy?";
  return "Hola, soy Milo. Ya sé lo que estuviste mirando en esta página. Preguntame lo que quieras.";
}

export default function MiloDemo({ tracker }: MiloDemoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [started, setStarted] = useState(false);
  const openerRef = useRef("");

  useEffect(() => {
    openerRef.current = buildDemoOpener(tracker);
  }, []); // eslint-disable-line

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !started) setTimeout(() => setStarted(true), 500);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  return (
    <section id="demo" data-section="demo" ref={sectionRef} className="py-32 relative overflow-hidden">
      <div className="section-divider absolute top-0 inset-x-0" />

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(99,102,241,0.07) 0%, transparent 70%)"
        }} />
        {/* Floating particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-accent/30"
            style={{
              width: 2 + (i % 3), height: 2 + (i % 3),
              left: `${10 + i * 11}%`,
              top: `${15 + (i % 4) * 20}%`,
              animation: `float ${4 + i * 0.7}s ease-in-out ${i * 0.5}s infinite`,
              opacity: 0.35,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium" style={{ color: "rgba(99,102,241,0.9)" }}>Demo en vivo</span>
          </div>
          <h2 className="font-syne font-black text-[#eeeae4] leading-[0.9] mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", letterSpacing: "-0.035em" }}>
            Hablale. Ya sabe<br />lo que estuviste mirando.
          </h2>
          <p style={{ color: "rgba(238,234,228,0.4)", fontSize: "1.1rem", fontWeight: 300 }}>
            Esto es exactamente lo que tus visitantes van a vivir en tu web.
          </p>
        </div>

        {/* Main layout — Milo left, chat right */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">

          {/* Milo */}
          <div ref={containerRef} className="flex flex-col items-center gap-5 flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 60% 70% at 50% 40%, rgba(99,102,241,0.24) 0%, transparent 70%)",
                transform: "scale(1.6)",
              }} />
              <MiloAvatar
                size={300}
                isSpeaking={isSpeaking}
                mousePosition={tracker.mousePosition}
                containerRef={containerRef}
                className="relative z-10 milo-glow"
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
              style={{
                background: "rgba(14,14,20,0.9)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${isSpeaking ? "bg-accent" : "bg-green-500"}`}
                style={{ animation: "pulse-glow 2s ease-in-out infinite" }} />
              <span className="text-xs" style={{ color: "rgba(238,234,228,0.45)" }}>
                {isSpeaking ? "Milo está respondiendo…" : "Milo · observando esta página"}
              </span>
            </div>

            {/* Intent badge */}
            {tracker.context.inferredIntent !== "exploring" && (
              <div className="px-3 py-1 rounded-full"
                style={{
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.18)",
                }}>
                <span className="text-[10px] font-mono" style={{ color: "rgba(99,102,241,0.8)" }}>
                  intent: {tracker.context.inferredIntent}
                </span>
              </div>
            )}
          </div>

          {/* Chat panel */}
          <div className="w-full max-w-[400px] lg:w-[400px] flex-shrink-0" style={{ height: 480 }}>
            <div className="h-full rounded-2xl overflow-hidden"
              style={{
                background: "rgba(14,14,20,0.9)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.06) inset",
              }}>
              {started ? (
                <MiloChat
                  initialMessage={openerRef.current || buildDemoOpener(tracker)}
                  context={tracker.context}
                  onSpeakingChange={setIsSpeaking}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <div className="flex gap-1.5">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-2 h-2 rounded-full bg-accent/40"
                        style={{ animation: `float 1.2s ease ${d}ms infinite` }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: "rgba(238,234,228,0.25)" }}>
                    Milo está observando…
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center mt-10 text-xs" style={{ color: "rgba(238,234,228,0.18)" }}>
          Milo usa el contexto real de lo que hiciste en esta página
        </p>
      </div>
    </section>
  );
}
