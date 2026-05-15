"use client";

import { useEffect, useRef, useState } from "react";
import MiloChat from "./MiloChat";
import { MiloAvatarSmall } from "./MiloAvatar";
import { type BehaviorTrackerResult } from "@/lib/behavior-tracker";

function buildOpener(tracker: BehaviorTrackerResult): string {
  const ctx = tracker.context;
  if (ctx.isReturnVisitor) return "Bienvenido de vuelta. ¿Seguís evaluando o ya tenés más claro lo que necesitás?";
  const pricingTime = ctx.sectionsViewed["pricing"]?.time ?? 0;
  if (pricingTime > 20) return `Vi que pasaste ${Math.round(pricingTime)}s mirando los planes. ¿Querés que te cuente cuál tiene más sentido?`;
  if ((ctx.sectionsViewed["features"]?.time ?? 0) > 30) return "Vi que estuviste leyendo sobre el behavioral tracking. ¿Querés probarlo en tu web?";
  if (ctx.timeOnSite > 60) return `Llevás ${Math.round(ctx.timeOnSite / 60)} minuto${ctx.timeOnSite > 120 ? "s" : ""} explorando. ¿Puedo ayudarte a decidir?`;
  if (ctx.localHour >= 22 || ctx.localHour < 6) return "Hola. Es tarde. ¿Qué necesitás saber para decidir hoy?";
  return "Hola, soy Milo. Ya sé lo que estuviste mirando en esta página. Preguntame lo que quieras.";
}

export default function MiloWidget({ tracker }: { tracker: BehaviorTrackerResult }) {
  const [phase, setPhase] = useState<"hidden" | "bubble" | "open">("hidden");
  const [opener, setOpener] = useState("");
  const firedRef = useRef(false);

  // Aparece a los 5 segundos
  useEffect(() => {
    if (firedRef.current) return;
    const t1 = setTimeout(() => {
      setOpener(buildOpener(tracker));
      setPhase("bubble");
      firedRef.current = true;

      // En desktop (≥640px) se auto-abre; en mobile el usuario toca la burbuja
      if (window.innerWidth >= 640) {
        const t2 = setTimeout(() => {
          setPhase("open");
        }, 1200);
        return () => clearTimeout(t2);
      }
    }, 5000);
    return () => clearTimeout(t1);
  }, [tracker]);

  // Burbuja colapsada
  if (phase === "hidden") return null;

  return (
    <>
      {/* Widget flotante */}
      <div
        className="fixed z-[900] flex flex-col items-end widget-gap"
        style={{
          pointerEvents: "auto",
          bottom: "max(16px, env(safe-area-inset-bottom, 16px))",
          right: "clamp(12px, 4vw, 24px)",
        }}
      >
        {/* Panel de chat */}
        <div
          className="origin-bottom-right transition-all duration-500"
          style={{
            width: "min(380px, calc(100vw - 24px))",
            height: "min(480px, calc(100svh - 120px))",
            opacity: phase === "open" ? 1 : 0,
            transform: phase === "open" ? "scale(1) translateY(0)" : "scale(0.92) translateY(16px)",
            pointerEvents: phase === "open" ? "auto" : "none",
          }}
        >
          <MiloChat
            initialMessage={phase === "open" ? opener : undefined}
            context={tracker.context}
            onClose={() => setPhase("bubble")}
          />
        </div>

        {/* Botón burbuja */}
        <button
          onClick={() => setPhase(phase === "open" ? "bubble" : "open")}
          className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #7c6cff, #6057cc)",
            boxShadow: "0 8px 32px rgba(124,108,255,0.5), 0 0 0 3px rgba(124,108,255,0.2)",
          }}
          aria-label={phase === "open" ? "Cerrar chat" : "Hablar con Milo"}
        >
          {phase === "open" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <MiloAvatarSmall size={52} />
          )}

          {/* Pulso cuando está en burbuja (llama la atención) */}
          {phase === "bubble" && (
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: "rgba(124,108,255,0.4)",
                animation: "widget-pulse 1.8s ease-out 3",
              }}
            />
          )}
        </button>
      </div>

      <style>{`
        @keyframes widget-pulse {
          0%   { transform: scale(1);   opacity: 0.7; }
          70%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .widget-gap { gap: 10px; }
        @media (min-width: 640px) { .widget-gap { gap: 12px; } }
      `}</style>
    </>
  );
}
