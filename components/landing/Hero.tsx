"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import MiloAvatar from "./MiloAvatar";
import MiloChat from "./MiloChat";
import { type BehaviorTrackerResult } from "@/lib/behavior-tracker";

export default function Hero({ tracker }: { tracker: BehaviorTrackerResult }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [miloSpeaking, setMiloSpeaking] = useState(false);
  const [hovered, setHovered] = useState(false);

  const initialMsg = tracker.triggerMessage
    ?? (tracker.context.isReturnVisitor
      ? "Bienvenido de vuelta. Ya sé lo que estuviste mirando."
      : "Hola, soy Milo. Estoy observando tu comportamiento en la página ahora mismo. Preguntame lo que quieras.");

  return (
    <section
      data-section="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: 64,
        overflow: "hidden",
      }}
    >
      {/* Deep glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 75% 55% at 62% 42%, rgba(99,102,241,0.1) 0%, transparent 65%)",
      }} />
      {/* Bottom fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
        background: "linear-gradient(to top, #07070a, transparent)",
        pointerEvents: "none",
      }} />

      <div className="wrap" style={{ position: "relative", paddingTop: 80, paddingBottom: 80 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "3rem",
          alignItems: "center",
        }}
          className="hero-grid"
        >
          {/* ── LEFT ── */}
          <div className="anim-slide-up" style={{ textAlign: "center" }}>
            <div className="badge" style={{ marginBottom: 28, display: "inline-flex" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-accent)", animation: "glow-pulse 2s ease-in-out infinite" }} />
              La primera web que realmente entiende a cada visitante
            </div>

            <h1 className="display display-xl" style={{ marginBottom: 24 }}>
              Tu web<br />
              observa.<br />
              Entiende.<br />
              <span className="gradient-text">Responde.</span>
            </h1>

            <p style={{
              fontSize: "1.125rem",
              fontWeight: 300,
              color: "var(--c-muted)",
              lineHeight: 1.7,
              maxWidth: 460,
              margin: "0 auto 32px",
            }}>
              Meetzy ve lo que cada visitante hace en tu sitio.
              Cuando habla, ya los conoce.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
              <Link href="/dashboard/new" className="btn-primary">
                Crear mi agente gratis
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <a href="#demo" className="btn-ghost">Hablale a Milo →</a>
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--c-muted2)" }}>
              Sin código · Sin tarjeta · 10 minutos
            </p>
          </div>

          {/* ── RIGHT — MILO ── */}
          <div
            ref={containerRef}
            className="anim-fade-in"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
          >
            {/* Avatar */}
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <div className="milo-halo" />
              <div
                style={{ position: "relative", zIndex: 1, cursor: "none" }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => { setChatOpen(true); tracker.clearTrigger(); }}
              >
                <MiloAvatar
                  size={300}
                  isSpeaking={miloSpeaking}
                  mousePosition={tracker.mousePosition}
                  containerRef={containerRef}
                  className="milo-glow"
                />
                {hovered && !chatOpen && (
                  <div className="anim-fade-in" style={{
                    position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)",
                    whiteSpace: "nowrap", padding: "6px 14px", borderRadius: 100,
                    background: "rgba(15,15,20,0.96)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    fontSize: "0.72rem",
                    color: "rgba(236,234,229,0.75)",
                    zIndex: 10,
                  }}>
                    Hablame, ya sé lo que estuviste mirando
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 100,
              background: "rgba(15,15,20,0.9)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: chatOpen ? "var(--c-accent)" : "var(--c-green)",
                animation: "glow-pulse 2.5s ease-in-out infinite",
              }} />
              <span style={{ fontSize: "0.72rem", color: "var(--c-muted)" }}>
                {chatOpen ? "Conversando con Milo" : "Milo está observando esta página"}
              </span>
            </div>

            {/* Proactive trigger */}
            {tracker.triggerMessage && !chatOpen && (
              <div className="anim-slide-up" style={{ width: "100%", maxWidth: 340 }}>
                <div style={{
                  padding: 16, borderRadius: "0 18px 18px 18px",
                  background: "rgba(15,15,20,0.96)",
                  border: "1px solid rgba(99,102,241,0.28)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
                }}>
                  <p style={{ fontSize: "0.875rem", color: "var(--c-text)", lineHeight: 1.55, marginBottom: 12 }}>
                    {tracker.triggerMessage}
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => { setChatOpen(true); tracker.clearTrigger(); }}
                      className="btn-primary"
                      style={{ padding: "6px 14px", fontSize: "0.75rem" }}
                    >
                      Sí, contame
                    </button>
                    <button
                      onClick={tracker.clearTrigger}
                      className="btn-ghost"
                      style={{ padding: "6px 14px", fontSize: "0.75rem" }}
                    >
                      Ahora no
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Chat */}
            {chatOpen && (
              <div className="anim-slide-up" style={{ width: "100%", maxWidth: 360, height: 380 }}>
                <MiloChat
                  initialMessage={initialMsg}
                  context={tracker.context}
                  onSpeakingChange={setMiloSpeaking}
                  onClose={() => setChatOpen(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive grid */}
      <style>{`
        @media (min-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr 1fr !important;
            text-align: left !important;
          }
          .hero-grid > div:first-child {
            text-align: left !important;
          }
          .hero-grid > div:first-child p {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          .hero-grid > div:first-child > div:nth-child(3) {
            justify-content: flex-start !important;
          }
        }
      `}</style>
    </section>
  );
}
