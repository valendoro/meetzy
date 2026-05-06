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
    ?? (tracker.context.isReturnVisitor
      ? "Bienvenido de vuelta. Ya sé lo que estuviste mirando."
      : "Hola, soy Milo. Ya estoy observando lo que hacés en la página.");

  return (
    <section
      data-section="hero"
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Deep center glow */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(99,102,241,0.09) 0%, transparent 65%)"
        }} />
        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-40" style={{
          background: "linear-gradient(to top, #060608, transparent)"
        }} />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── LEFT ────────────────────────────── */}
          <div className="animate-slide-up text-center lg:text-left order-2 lg:order-1">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
              style={{
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.25)",
              }}>
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-xs text-[rgba(238,234,228,0.65)] font-medium tracking-wide">
                La primera web que realmente entiende
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-syne font-black text-[#eeeae4] leading-[0.88] mb-6"
              style={{ fontSize: "clamp(3rem, 6.5vw, 5.5rem)", letterSpacing: "-0.045em" }}>
              Tu web<br />
              observa.<br />
              Entiende.<br />
              <span className="gradient-text">Responde.</span>
            </h1>

            {/* Subline */}
            <p className="text-lg font-light leading-relaxed mb-8 mx-auto lg:mx-0 max-w-md"
              style={{ color: "rgba(238,234,228,0.42)" }}>
              Meetzy ve lo que cada visitante hace en tu sitio.
              Cuando habla, ya los conoce.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 bg-accent hover:bg-[#4f46e5] text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-150 text-sm shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)]"
              >
                Crear mi agente gratis
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 font-medium px-6 py-3.5 rounded-xl transition-all duration-150 text-sm"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(238,234,228,0.6)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
                  (e.currentTarget as HTMLElement).style.color = "#eeeae4";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(238,234,228,0.6)";
                }}
              >
                Hablale a Milo →
              </a>
            </div>

            <p className="text-xs" style={{ color: "rgba(238,234,228,0.2)" }}>
              Sin código · Sin tarjeta · 10 minutos
            </p>
          </div>

          {/* ── RIGHT — MILO ────────────────────── */}
          <div
            ref={containerRef}
            className="flex flex-col items-center gap-5 order-1 lg:order-2 animate-fade-in"
          >
            {/* Milo + glow */}
            <div className="relative">
              {/* Multi-layer glow */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 70% 80% at 50% 45%, rgba(99,102,241,0.22) 0%, transparent 70%)",
                transform: "scale(1.5)",
              }} />

              {/* Avatar */}
              <div
                className="relative cursor-pointer select-none"
                onMouseEnter={() => setHoverMilo(true)}
                onMouseLeave={() => setHoverMilo(false)}
                onClick={() => { setChatOpen(true); tracker.clearTrigger(); }}
              >
                <MiloAvatar
                  size={310}
                  isSpeaking={miloSpeaking}
                  mousePosition={tracker.mousePosition}
                  containerRef={containerRef}
                  className="relative z-10 milo-glow"
                />

                {/* Hover tooltip */}
                {hoverMilo && !chatOpen && (
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-3 py-1.5 rounded-full animate-fade-in z-20"
                    style={{
                      background: "rgba(14,14,20,0.95)",
                      border: "1px solid rgba(99,102,241,0.3)",
                      color: "rgba(238,234,228,0.8)",
                    }}
                  >
                    Hablame, ya sé lo que estuviste mirando
                  </div>
                )}
              </div>
            </div>

            {/* Status pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "rgba(14,14,20,0.9)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${chatOpen ? "bg-accent" : "bg-green-500"}`}
                style={{ animation: "pulse-glow 2s ease-in-out infinite" }} />
              <span className="text-xs" style={{ color: "rgba(238,234,228,0.45)" }}>
                {chatOpen ? "Conversando con Milo" : "Milo está observando esta página"}
              </span>
            </div>

            {/* Proactive trigger */}
            {tracker.triggerMessage && !chatOpen && (
              <div className="w-full max-w-[320px] animate-slide-up">
                <div className="rounded-2xl rounded-tl-sm p-4"
                  style={{
                    background: "rgba(14,14,20,0.95)",
                    border: "1px solid rgba(99,102,241,0.28)",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.4), 0 0 30px rgba(99,102,241,0.08)",
                  }}>
                  <p className="text-sm text-[#eeeae4] leading-relaxed mb-3">
                    {tracker.triggerMessage}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setChatOpen(true); tracker.clearTrigger(); }}
                      className="text-xs font-semibold bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-[#4f46e5] transition-colors"
                    >
                      Sí, contame
                    </button>
                    <button
                      onClick={tracker.clearTrigger}
                      className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                      style={{
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(238,234,228,0.4)",
                      }}
                    >
                      Ahora no
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Chat panel */}
            {chatOpen && (
              <div className="w-full max-w-[360px] animate-slide-up" style={{ height: 380 }}>
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
