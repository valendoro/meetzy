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
  const [chatOpener, setChatOpener] = useState("");
  const demoStartedRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !demoStartedRef.current) {
        demoStartedRef.current = true;
        setTimeout(() => {
          setChatOpener(buildDemoOpener(tracker));
          setStarted(true);
        }, 500);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [tracker]);

  return (
    <section id="demo" data-section="demo" ref={sectionRef} className="section-y relative overflow-hidden">
      <div className="section-divider-top absolute top-0 left-0 right-0 z-10" />

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,108,255,0.075) 0%, transparent 70%)"
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

      <div className="relative wrap z-[1]">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ background: "var(--c-accent-dim)", border: "1px solid rgba(124,108,255,0.28)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium" style={{ color: "rgba(200,194,255,0.95)" }}>
              Demo en vivo
            </span>
          </div>
          <h2 className="display display-lg mb-4">
            Hablale. Ya sabe
            <br />
            lo que estuviste mirando.
          </h2>
          <p className="text-muted text-[1.1rem] font-light max-w-xl mx-auto leading-relaxed">
            Esto es exactamente lo que tus visitantes van a vivir en tu web.
          </p>
        </div>

        {/* Main layout — Milo left, chat right */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">

          {/* Milo */}
          <div ref={containerRef} className="flex flex-col items-center gap-5 flex-shrink-0">
            <div className="relative">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 70% at 50% 40%, rgba(124,108,255,0.22) 0%, transparent 70%)",
                  transform: "scale(1.6)",
                }}
              />
              <MiloAvatar
                size={300}
                isSpeaking={isSpeaking}
                mousePosition={tracker.mousePosition}
                containerRef={containerRef}
                className="relative z-10 milo-glow"
              />
            </div>

            {/* Status */}
            <div
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
              style={{
                background: "var(--c-surface)",
                border: "1px solid var(--c-border)",
              }}
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors animate-pulse ${isSpeaking ? "bg-accent" : "bg-green-500"}`}
              />
              <span className="text-xs text-muted">
                {isSpeaking ? "Milo está respondiendo…" : "Milo · observando esta página"}
              </span>
            </div>

            {/* Intent badge */}
            {tracker.context.inferredIntent !== "exploring" && (
              <div
                className="px-3 py-1 rounded-full"
                style={{
                  background: "var(--c-accent-dim)",
                  border: "1px solid rgba(124,108,255,0.22)",
                }}
              >
                <span className="text-[10px] font-mono" style={{ color: "rgba(183,176,255,0.9)" }}>
                  intent: {tracker.context.inferredIntent}
                </span>
              </div>
            )}
          </div>

          {/* Chat panel */}
          <div className="w-full max-w-[400px] lg:w-[400px] flex-shrink-0" style={{ height: 480 }}>
            <div
              className="h-full rounded-2xl overflow-hidden"
              style={{
                background: "var(--c-surface)",
                border: "1px solid var(--c-border)",
                boxShadow:
                  "0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,108,255,0.07) inset",
              }}
            >
              {started ? (
                <MiloChat
                  initialMessage={chatOpener || buildDemoOpener(tracker)}
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
                  <p className="text-xs text-[var(--c-muted2)]">
                    Milo está observando…
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center mt-10 text-xs text-[var(--c-muted2)] opacity-70">
          Milo usa el contexto real de lo que hiciste en esta página
        </p>
      </div>
    </section>
  );
}
