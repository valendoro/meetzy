"use client";

import { useEffect, useRef, useState } from "react";
import BrandAvatar from "@/components/avatar/BrandAvatar";
import { type BehaviorTrackerResult } from "@/lib/behavior-tracker";

function useDemoAvatarSize() {
  const [size, setSize] = useState(220);
  useEffect(() => {
    const update = () => setSize(window.innerWidth < 400 ? 160 : window.innerWidth < 640 ? 200 : 260);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

interface MiloDemoProps {
  tracker: BehaviorTrackerResult;
}

export default function MiloDemo({ tracker }: MiloDemoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const demoAvatarSize = useDemoAvatarSize();

  return (
    <section id="demo" data-section="demo" className="section-y relative overflow-hidden">
      <div className="section-divider-top absolute top-0 left-0 right-0 z-10" />

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,108,255,0.075) 0%, transparent 70%)"
        }} />
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
            Milo ya apareció en tu pantalla. Eso es exactamente lo que van a vivir tus visitantes.
          </p>
        </div>

        {/* Milo centrado */}
        <div className="flex flex-col items-center gap-6">
          <div ref={containerRef} className="relative">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 60% 70% at 50% 40%, rgba(124,108,255,0.22) 0%, transparent 70%)",
                transform: "scale(1.6)",
              }}
            />
            <BrandAvatar
              character="alex"
              brandColor="#7c6cff"
              brandName="Meetzy"
              animation="idle"
              size={demoAvatarSize}
              mousePosition={tracker.mousePosition}
              containerRef={containerRef}
              className="relative z-10 milo-glow"
            />
          </div>

          {/* Estado */}
          <div
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
            style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0 bg-green-500 animate-pulse" />
            <span className="text-xs text-muted">Milo · observando esta página</span>
          </div>

          {/* Intent badge */}
          {tracker.context.inferredIntent !== "exploring" && (
            <div
              className="px-3 py-1 rounded-full"
              style={{ background: "var(--c-accent-dim)", border: "1px solid rgba(124,108,255,0.22)" }}
            >
              <span className="text-[10px] font-mono" style={{ color: "rgba(183,176,255,0.9)" }}>
                intent: {tracker.context.inferredIntent}
              </span>
            </div>
          )}

          {/* Arrow pointing to bottom-right widget */}
          <p className="text-center text-xs text-[var(--c-muted2)] opacity-60 mt-2">
            Milo ya te habló — aparece automáticamente
          </p>
        </div>
      </div>
    </section>
  );
}
