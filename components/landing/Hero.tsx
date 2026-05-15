"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MiloAvatar from "./MiloAvatar";
import MiloChat from "./MiloChat";
import { type BehaviorTrackerResult } from "@/lib/behavior-tracker";

function useAvatarSize() {
  const [size, setSize] = useState(260);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 400) setSize(180);
      else if (w < 640) setSize(210);
      else if (w < 1024) setSize(240);
      else setSize(290);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

export default function Hero({ tracker }: { tracker: BehaviorTrackerResult }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [miloSpeaking, setMiloSpeaking] = useState(false);
  const [hovered, setHovered] = useState(false);
  const avatarSize = useAvatarSize();

  const initialMsg = tracker.triggerMessage
    ?? (tracker.context.isReturnVisitor
      ? "Bienvenido de vuelta. Ya sé lo que estuviste mirando."
      : "Hola, soy Milo. Estoy observando tu comportamiento en la página ahora mismo. Preguntame lo que quieras.");

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
      {/* Deep glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 75% 55% at 62% 42%, rgba(124,108,255,0.11) 0%, transparent 62%), radial-gradient(ellipse 50% 40% at 20% 70%, rgba(232,160,144,0.06) 0%, transparent 55%)",
      }} />
      {/* Bottom fade */}
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
              <a href="#demo" className="btn-ghost">Hablale a Milo →</a>
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--c-muted2)" }}>
              Sin código · Sin tarjeta · 10 minutos
            </p>
          </div>

          {/* ── RIGHT: Milo ── */}
          <div
            ref={containerRef}
            className="anim-fade-in hero-avatar-col"
          >
            {/* Avatar */}
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <div className="milo-halo" />
              <div
                style={{ position: "relative", zIndex: 1, cursor: "pointer" }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => { setChatOpen(true); tracker.clearTrigger(); }}
              >
                <MiloAvatar
                  size={avatarSize}
                  isSpeaking={miloSpeaking}
                  mousePosition={tracker.mousePosition}
                  containerRef={containerRef}
                  className="milo-glow"
                />
                {hovered && !chatOpen && (
                  <div className="anim-fade-in" style={{
                    position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)",
                    whiteSpace: "nowrap", padding: "6px 14px", borderRadius: 100,
                    background: "var(--c-surface2)",
                    border: "1px solid rgba(124,108,255,0.32)",
                    fontSize: "0.72rem",
                    color: "var(--c-muted)",
                    zIndex: 10,
                  }}>
                    Hablame, ya sé lo que estuviste mirando
                  </div>
                )}
              </div>
            </div>

            {/* Status pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "7px 14px", borderRadius: 100,
              background: "var(--c-surface)",
              border: "1px solid var(--c-border)",
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
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
                  background: "rgba(22,21,31,0.96)",
                  border: "1px solid rgba(124,108,255,0.28)",
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
              <div className="anim-slide-up hero-chat">
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
        .hero-copy {
          text-align: center;
        }
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
          gap: 16px;
        }
        .hero-chat {
          width: 100%;
          max-width: 360px;
          height: 340px;
        }

        @media (min-width: 640px) {
          .hero-btn-primary { flex: none; }
          .hero-chat { height: 380px; }
        }

        @media (min-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
          }
          .hero-copy {
            text-align: left;
          }
          .hero-lead {
            margin-left: 0;
            margin-right: 0;
          }
          .hero-btns {
            justify-content: flex-start;
          }
        }
      `}</style>
    </section>
  );
}
