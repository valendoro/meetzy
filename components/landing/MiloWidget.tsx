"use client";

import { useEffect, useRef, useState } from "react";
import MiloChat from "./MiloChat";
import AgentFace from "@/components/avatar/AgentFace";
import { type BehaviorTrackerResult } from "@/lib/behavior-tracker";

// Props de marca — en producción vendría del agente configurado por el cliente
const BRAND_COLOR  = "#7c6cff";
const BRAND_NAME   = "Meetzy";
const AGENT_NAME   = "Milo";

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

// Burbuja con cara + nombre — botón principal del widget
function WidgetBubble({
  phase,
  streaming,
  onClick,
}: {
  phase: "bubble" | "open";
  streaming?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={phase === "open" ? `Cerrar ${AGENT_NAME}` : `Hablar con ${AGENT_NAME}`}
      className="relative flex items-center gap-3 pl-1 pr-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 select-none"
      style={{
        height: 58,
        background: "rgba(14,13,22,0.97)",
        border: `2px solid ${BRAND_COLOR}44`,
        boxShadow: `0 8px 32px ${BRAND_COLOR}44, 0 2px 8px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Cara */}
      <div
        className="rounded-full overflow-hidden flex-shrink-0"
        style={{ width: 46, height: 46, outline: `2px solid ${BRAND_COLOR}66`, outlineOffset: 1 }}
      >
        <AgentFace size={46} brandColor={BRAND_COLOR} isSpeaking={streaming} />
      </div>

      {/* Texto */}
      {phase === "bubble" && (
        <div className="flex flex-col items-start leading-tight">
          <span className="text-white text-[13px] font-semibold">{AGENT_NAME}</span>
          <span className="text-[10px]" style={{ color: `${BRAND_COLOR}cc` }}>{BRAND_NAME}</span>
        </div>
      )}

      {/* Ícono cerrar cuando está abierto */}
      {phase === "open" && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: "rgba(255,255,255,0.5)" }}>
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      )}

      {/* Punto de actividad */}
      <span
        className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-[rgba(14,13,22,0.97)]"
        style={{ background: streaming ? BRAND_COLOR : "#22c55e" }}
      />

      {/* Pulso inicial */}
      {phase === "bubble" && (
        <span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: `${BRAND_COLOR}33`, animation: "wpulse 2s ease-out 3" }}
        />
      )}
    </button>
  );
}

export default function MiloWidget({ tracker }: { tracker: BehaviorTrackerResult }) {
  const [phase, setPhase]         = useState<"hidden" | "bubble" | "open">("hidden");
  const [opener, setOpener]       = useState("");
  const [streaming, setStreaming] = useState(false);
  const [isMobile, setIsMobile]   = useState(false);
  const firedRef    = useRef(false);
  // Keep latest tracker in a ref so the one-time timer can read it without
  // being in its dependency array (tracker is a new object on every render).
  const trackerRef  = useRef(tracker);
  useEffect(() => { trackerRef.current = tracker; });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Aparece la burbuja a los 6 s — solo burbuja, no auto-abre el chat
  // El usuario interactúa solo (o el Hero trigger lo abre)
  useEffect(() => {
    if (firedRef.current) return;
    const t1 = setTimeout(() => {
      setOpener(buildOpener(trackerRef.current));
      setPhase("bubble");
      firedRef.current = true;
    }, 6000);
    return () => clearTimeout(t1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escucha el evento global del Hero para abrir el widget directamente
  useEffect(() => {
    const handler = () => {
      setOpener(buildOpener(trackerRef.current));
      setPhase("open");
      firedRef.current = true;
    };
    window.addEventListener("meetzy:open-widget", handler);
    return () => window.removeEventListener("meetzy:open-widget", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock scroll en mobile
  useEffect(() => {
    document.body.style.overflow = isMobile && phase === "open" ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, phase]);

  if (phase === "hidden") return null;

  const toggle = () => setPhase(p => p === "open" ? "bubble" : "open");

  // ── MOBILE: bottom sheet ─────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {phase === "open" && (
          <div
            className="fixed inset-0 z-[899]"
            style={{ background: "rgba(6,5,10,0.6)", backdropFilter: "blur(4px)" }}
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
          <div style={{
            background: "rgba(14,13,22,0.99)",
            borderRadius: "20px 20px 0 0",
            borderTop: `1px solid ${BRAND_COLOR}33`,
            paddingTop: 10,
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", margin: "0 auto" }} />
          </div>
          <div style={{ height: "72svh", background: "rgba(14,13,22,0.99)" }}>
            <MiloChat
              initialMessage={phase === "open" ? opener : undefined}
              context={tracker.context}
              onClose={() => setPhase("bubble")}
            />
          </div>
        </div>

        {/* FAB burbuja */}
        <div className="fixed z-[900]" style={{ bottom: "max(20px, env(safe-area-inset-bottom, 20px))", right: 16 }}>
          {phase === "bubble" && (
            <WidgetBubble phase="bubble" streaming={streaming} onClick={() => setPhase("open")} />
          )}
        </div>

        <style>{`@keyframes wpulse { 0%{transform:scale(1);opacity:.6} 70%,100%{transform:scale(1.5);opacity:0} }`}</style>
      </>
    );
  }

  // ── DESKTOP: floating widget ─────────────────────────────────────────
  return (
    <>
      <div
        className="fixed z-[900] flex flex-col items-end"
        style={{
          bottom: "max(24px, env(safe-area-inset-bottom, 24px))",
          right: "clamp(16px, 3vw, 24px)",
          gap: 12,
        }}
      >
        {/* Panel de chat */}
        <div
          className="origin-bottom-right transition-all duration-500"
          style={{
            width: 380, height: 520,
            opacity: phase === "open" ? 1 : 0,
            transform: phase === "open" ? "scale(1) translateY(0)" : "scale(0.93) translateY(20px)",
            pointerEvents: phase === "open" ? "auto" : "none",
          }}
        >
          <MiloChat
            initialMessage={phase === "open" ? opener : undefined}
            context={tracker.context}
            onClose={() => setPhase("bubble")}
          />
        </div>

        {/* Burbuja */}
        <WidgetBubble phase={phase === "open" ? "open" : "bubble"} streaming={streaming} onClick={toggle} />
      </div>

      <style>{`@keyframes wpulse { 0%{transform:scale(1);opacity:.6} 70%,100%{transform:scale(1.5);opacity:0} }`}</style>
    </>
  );
}
