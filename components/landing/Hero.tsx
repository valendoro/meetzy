"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import MiloAvatar from "./MiloAvatar";
import MiloChat from "./MiloChat";
import { type BehaviorTrackerResult } from "@/lib/behavior-tracker";

interface HeroProps {
  tracker: BehaviorTrackerResult;
}

export default function Hero({ tracker }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [miloSpeaking, setMiloSpeaking] = useState(false);
  const [hoverMilo, setHoverMilo] = useState(false);

  const initialMsg = tracker.triggerMessage
    ? tracker.triggerMessage
    : tracker.context.isReturnVisitor
    ? "Bienvenido de vuelta. Ya sé lo que estuviste mirando antes."
    : "Hola, soy Milo. Observo a los visitantes de tu web para responderles con contexto. Probame.";

  return (
    <section
      data-section="hero"
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
    >
      {/* Radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "30%", left: "55%",
          width: 600, height: 600,
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 w-full py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── LEFT — copy ────────────────────────────────── */}
          <div className="animate-slide-up text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.07)] mb-8">
              <span className="text-accent text-xs">✦</span>
              <span className="text-xs text-[rgba(238,234,228,0.65)] font-medium">
                La primera web que realmente entiende
              </span>
            </div>

            <h1
              className="font-syne font-black text-[#eeeae4] leading-[0.88] mb-6"
              style={{
                fontSize: "clamp(3rem, 7vw, 6rem)",
                letterSpacing: "-0.04em",
              }}
            >
              Tu web<br />
              observa.<br />
              Entiende.<br />
              <span className="gradient-text">Responde.</span>
            </h1>

            <p className="text-lg font-light text-[rgba(238,234,228,0.4)] leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
              Meetzy ve lo que cada visitante hace en tu sitio.
              Y cuando habla, ya los conoce.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 bg-accent hover:bg-[#4f46e5] text-white font-medium px-6 py-3.5 rounded-xl transition-colors text-sm"
              >
                Crear mi agente gratis
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 border border-[rgba(255,255,255,0.09)] text-[rgba(238,234,228,0.55)] font-medium px-6 py-3.5 rounded-xl hover:border-[rgba(255,255,255,0.18)] hover:text-[#eeeae4] transition-all text-sm"
              >
                Hablale a Milo →
              </a>
            </div>

            <p className="text-xs text-[rgba(238,234,228,0.2)]">
              Sin código · Sin tarjeta · 10 minutos
            </p>
          </div>

          {/* ── RIGHT — Milo ───────────────────────────────── */}
          <div
            ref={containerRef}
            className="flex flex-col items-center gap-4 animate-fade-in"
          >
            {/* Milo character */}
            <div className="relative">
              {/* Glow behind Milo */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse 60% 70% at 50% 40%, rgba(99,102,241,0.18) 0%, transparent 70%)",
                  borderRadius: "50%",
                  transform: "scale(1.4)",
                }}
              />

              <div
                className="relative cursor-pointer"
                onMouseEnter={() => setHoverMilo(true)}
                onMouseLeave={() => setHoverMilo(false)}
                onClick={() => { setChatOpen(true); tracker.clearTrigger(); }}
              >
                <MiloAvatar
                  size={300}
                  isSpeaking={miloSpeaking}
                  mousePosition={tracker.mousePosition}
                  containerRef={containerRef}
                  className="milo-glow relative z-10"
                />

                {/* Hover tooltip */}
                {hoverMilo && !chatOpen && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#16161c] border border-[rgba(255,255,255,0.08)] text-xs text-[rgba(238,234,228,0.7)] px-3 py-1.5 rounded-full z-20 animate-fade-in">
                    Hablame, ya sé lo que estuviste mirando
                  </div>
                )}
              </div>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0e0e12] border border-[rgba(255,255,255,0.07)] rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-[rgba(238,234,228,0.45)]">
                {chatOpen ? "Conversando" : "Observando"}
              </span>
            </div>

            {/* Proactive trigger bubble (if no chat open) */}
            {tracker.triggerMessage && !chatOpen && (
              <div className="w-full max-w-[320px] animate-slide-up">
                <div className="bg-[#0e0e12] border border-[rgba(99,102,241,0.25)] rounded-2xl rounded-tl-sm p-4">
                  <p className="text-sm text-[#eeeae4] leading-relaxed mb-3">
                    {tracker.triggerMessage}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setChatOpen(true); tracker.clearTrigger(); }}
                      className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#4f46e5] transition-colors"
                    >
                      Sí, contame
                    </button>
                    <button
                      onClick={tracker.clearTrigger}
                      className="text-xs text-[rgba(238,234,228,0.4)] border border-[rgba(255,255,255,0.08)] px-3 py-1.5 rounded-lg hover:text-[rgba(238,234,228,0.7)] transition-colors"
                    >
                      Ahora no
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Chat panel */}
            {chatOpen && (
              <div className="w-full max-w-[360px] h-[400px] animate-slide-up">
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
    </section>
  );
}
