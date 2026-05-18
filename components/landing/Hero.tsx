"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AgentFace from "@/components/avatar/AgentFace";
import { type BehaviorTrackerResult } from "@/lib/behavior-tracker";

export default function Hero({ tracker }: { tracker: BehaviorTrackerResult }) {
  const [hovered, setHovered] = useState(false);
  const [pulse, setPulse]     = useState(false);

  // Pulse the face once on mount to draw attention
  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Open the widget when "Hablale a Milo" is clicked
  const openWidget = () => {
    window.dispatchEvent(new CustomEvent("meetzy:open-widget"));
  };

  return (
    <section
      data-section="hero"
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        paddingTop: "var(--nav-height)",
        overflow: "hidden",
      }}
    >
      {/* Background glows */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 75% 55% at 65% 45%, rgba(124,108,255,0.10) 0%, transparent 62%), radial-gradient(ellipse 50% 40% at 20% 70%, rgba(232,160,144,0.05) 0%, transparent 55%)",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
        background: "linear-gradient(to top, var(--c-bg), transparent)",
        pointerEvents: "none",
      }} />

      <div className="wrap hero-wrap">
        <div className="hero-grid">

          {/* ── LEFT: copy ── */}
          <div className="anim-slide-up hero-copy">
            <div className="badge" style={{ marginBottom: 20, display: "inline-flex" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-accent)", animation: "glow-pulse 2s ease-in-out infinite" }} />
              La primera web que realmente entiende a cada visitante
            </div>

            <h1 className="display display-xl" style={{ marginBottom: 20 }}>
              Tu web<br />
              observa.<br />
              Entiende.<br />
              <span className="gradient-text">Responde.</span>
            </h1>

            <p className="hero-lead">
              Meetzy ve lo que cada visitante hace en tu sitio.
              Cuando habla, ya los conoce.
            </p>

            <div className="hero-btns">
              <Link href="/dashboard/new" className="btn-primary hero-btn-primary">
                Crear mi agente gratis
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <button onClick={openWidget} className="btn-ghost" style={{ cursor: "pointer" }}>
                Hablale a Milo →
              </button>
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--c-muted2)" }}>
              Sin código · Sin tarjeta · 10 minutos
            </p>
          </div>

          {/* ── RIGHT: agent face showcase ── */}
          <div className="anim-fade-in hero-avatar-col">

            {/* Glow halo behind face */}
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <div className="milo-halo" />

              {/* Face bubble */}
              <div
                className="hero-face-ring"
                style={{
                  transform: hovered ? "scale(1.04)" : "scale(1)",
                  transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                  cursor: "pointer",
                  position: "relative", zIndex: 1,
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={openWidget}
              >
                <AgentFace size={220} brandColor="#7c6cff" className="hero-face" />

                {/* Tooltip on hover */}
                {hovered && (
                  <div className="anim-fade-in" style={{
                    position: "absolute", bottom: -4, left: "50%",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap", padding: "6px 14px", borderRadius: 100,
                    background: "var(--c-surface2)",
                    border: "1px solid rgba(124,108,255,0.32)",
                    fontSize: "0.72rem", color: "var(--c-muted)", zIndex: 10,
                  }}>
                    Hablame, ya sé lo que estuviste mirando
                  </div>
                )}
              </div>

              {/* Ring pulse animation on mount */}
              {pulse && (
                <div style={{
                  position: "absolute", inset: -12, borderRadius: "50%",
                  border: "2px solid rgba(124,108,255,0.4)",
                  animation: "hero-ring-out 1.2s ease-out forwards",
                  pointerEvents: "none",
                }} />
              )}
            </div>

            {/* Status pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "7px 16px", borderRadius: 100,
              background: "var(--c-surface)",
              border: "1px solid var(--c-border)",
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                background: "var(--c-green)",
                animation: "glow-pulse 2.5s ease-in-out infinite",
              }} />
              <span style={{ fontSize: "0.72rem", color: "var(--c-muted)" }}>
                Milo está observando esta página
              </span>
            </div>

            {/* Widget preview hint */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 16px", borderRadius: 16,
              background: "rgba(124,108,255,0.07)",
              border: "1px solid rgba(124,108,255,0.18)",
              maxWidth: 320,
            }}>
              <AgentFace size={36} brandColor="#7c6cff" />
              <div>
                <p suppressHydrationWarning style={{ fontSize: "0.78rem", color: "var(--c-text)", lineHeight: 1.45, margin: 0 }}>
                  {tracker.context.isReturnVisitor
                    ? "Bienvenido de vuelta. ¿Seguís evaluando?"
                    : "Hola, soy Milo. Ya sé lo que estuviste mirando."}
                </p>
                <p style={{ fontSize: "0.66rem", color: "var(--c-muted2)", margin: "3px 0 0" }}>
                  Así se ve tu agente en tu web →
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .hero-wrap {
          padding-top: clamp(2rem, 5vw, 3rem);
          padding-bottom: clamp(2.5rem, 6vw, 5rem);
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          align-items: center;
        }
        .hero-copy { text-align: center; }
        .hero-lead {
          font-size: clamp(0.9rem, 2.5vw, 1.125rem);
          font-weight: 300;
          color: var(--c-muted);
          line-height: 1.7;
          max-width: 460px;
          margin: 0 auto 1.75rem;
        }
        .hero-btns {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        .hero-btn-primary {
          flex: 1 1 auto;
          max-width: 260px;
          justify-content: center;
        }
        .hero-avatar-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .hero-face-ring {
          border-radius: 50%;
          box-shadow:
            0 0 0 3px rgba(124,108,255,0.25),
            0 0 0 7px rgba(124,108,255,0.08),
            0 20px 60px rgba(124,108,255,0.3);
        }
        .hero-face {
          border-radius: 50%;
        }

        @media (min-width: 640px) {
          .hero-btn-primary { flex: none; }
        }
        @media (min-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
          }
          .hero-copy { text-align: left; }
          .hero-lead  { margin-left: 0; margin-right: 0; }
          .hero-btns  { justify-content: flex-start; }
        }

        @keyframes hero-ring-out {
          0%   { transform: scale(0.85); opacity: 0.8; }
          100% { transform: scale(1.6);  opacity: 0; }
        }
      `}</style>
    </section>
  );
}
