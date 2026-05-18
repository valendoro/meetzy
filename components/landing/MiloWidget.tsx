"use client";

import { useEffect, useRef, useState } from "react";
import MiloChat from "./MiloChat";
import { BrandAvatarSmall } from "@/components/avatar/BrandAvatar";
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
  const [isMobile, setIsMobile] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Aparece a los 5 segundos y siempre se auto-abre
  useEffect(() => {
    if (firedRef.current) return;
    const t1 = setTimeout(() => {
      setOpener(buildOpener(tracker));
      setPhase("bubble");
      const t2 = setTimeout(() => {
        setPhase("open");
        firedRef.current = true;
      }, 1200);
      return () => clearTimeout(t2);
    }, 5000);
    return () => clearTimeout(t1);
  }, [tracker]);

  // Lock scroll del body cuando el bottom sheet mobile está abierto
  useEffect(() => {
    if (isMobile && phase === "open") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, phase]);

  if (phase === "hidden") return null;

  // ── MOBILE: bottom sheet ──────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {phase === "open" && (
          <div
            className="fixed inset-0 z-[899]"
            style={{ background: "rgba(6,5,10,0.6)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
            onClick={() => setPhase("bubble")}
          />
        )}

        {/* Bottom sheet */}
        <div
          className="fixed left-0 right-0 z-[900]"
          style={{
            bottom: 0,
            transition: "transform 0.42s cubic-bezier(0.16,1,0.3,1)",
            transform: phase === "open" ? "translateY(0)" : "translateY(110%)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {/* Handle bar */}
          <div
            style={{
              background: "rgba(18,17,26,0.98)",
              borderRadius: "20px 20px 0 0",
              borderTop: "1px solid rgba(124,108,255,0.2)",
              paddingTop: 10,
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)", margin: "0 auto 0" }} />
          </div>

          {/* Chat */}
          <div style={{ height: "72svh", background: "rgba(18,17,26,0.98)" }}>
            <MiloChat
              initialMessage={phase === "open" ? opener : undefined}
              context={tracker.context}
              onClose={() => setPhase("bubble")}
            />
          </div>
        </div>

        {/* Bubble FAB (visible cuando está cerrado) */}
        {phase === "bubble" && (
          <div
            className="fixed z-[900]"
            style={{
              bottom: "max(20px, env(safe-area-inset-bottom, 20px))",
              right: 16,
            }}
          >
            <button
              onClick={() => setPhase("open")}
              className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl active:scale-95"
              style={{
                background: "linear-gradient(135deg, #7c6cff, #6057cc)",
                boxShadow: "0 8px 32px rgba(124,108,255,0.55), 0 0 0 3px rgba(124,108,255,0.2)",
              }}
              aria-label="Hablar con Milo"
            >
              <BrandAvatarSmall size={52} character="alex" brandColor="#7c6cff" />
              <span
                className="absolute inset-0 rounded-full"
                style={{ background: "rgba(124,108,255,0.4)", animation: "widget-pulse 1.8s ease-out 3" }}
              />
            </button>
          </div>
        )}

        <style>{`
          @keyframes widget-pulse {
            0%   { transform: scale(1);   opacity: 0.7; }
            70%  { transform: scale(1.6); opacity: 0; }
            100% { transform: scale(1.6); opacity: 0; }
          }
        `}</style>
      </>
    );
  }

  // ── DESKTOP: floating widget ──────────────────────────────────────
  return (
    <>
      <div
        className="fixed z-[900] flex flex-col items-end"
        style={{
          pointerEvents: "auto",
          bottom: "max(24px, env(safe-area-inset-bottom, 24px))",
          right: "clamp(16px, 3vw, 24px)",
          gap: 12,
        }}
      >
        {/* Panel */}
        <div
          className="origin-bottom-right transition-all duration-500"
          style={{
            width: 380,
            height: 520,
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

        {/* Bubble button */}
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
            <BrandAvatarSmall size={52} character="alex" brandColor="#7c6cff" />
          )}
          {phase === "bubble" && (
            <span
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(124,108,255,0.4)", animation: "widget-pulse 1.8s ease-out 3" }}
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
      `}</style>
    </>
  );
}
