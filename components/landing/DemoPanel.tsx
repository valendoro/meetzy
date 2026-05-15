"use client";

import { useEffect, useRef, useState } from "react";
import type { VisitorContext } from "@/lib/behavior-tracker";

interface DemoPanelProps {
  context: VisitorContext;
  visible: boolean;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

const INTENT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  exploring:    { label: "Explorando",    color: "#9ca3af", bg: "rgba(156,163,175,0.1)" },
  interested:   { label: "Interesado",    color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  evaluating:   { label: "Evaluando",     color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  ready_to_buy: { label: "Listo para comprar", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  hot_lead:     { label: "Hot lead 🔥",   color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  demo: "Demo",
  features: "Features",
  pricing: "Precios",
  "how-it-works": "Cómo funciona",
  "use-cases": "Casos de uso",
  testimonials: "Testimonios",
};

export default function DemoPanel({ context, visible, onClose }: DemoPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setAnimated(true), 50);
    } else {
      setAnimated(false);
    }
  }, [visible]);

  // Click outside to close
  useEffect(() => {
    if (!visible) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [visible, onClose]);

  if (!visible && !animated) return null;

  const sections = Object.entries(context.sectionsViewed)
    .filter(([, v]) => v.time > 1)
    .sort((a, b) => b[1].time - a[1].time);

  const maxTime = Math.max(...sections.map(([, v]) => v.time), 1);
  const intent = INTENT_LABELS[context.inferredIntent] ?? INTENT_LABELS.exploring;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: animated && visible ? 1 : 0 }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed left-1/2 top-1/2 z-[999] w-full max-w-md -translate-x-1/2 transition-all duration-500"
        style={{
          transform: `translate(-50%, ${animated && visible ? "-50%" : "-42%"})`,
          opacity: animated && visible ? 1 : 0,
        }}
      >
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "rgba(10,10,16,0.97)",
            border: "1px solid rgba(124,108,255,0.25)",
            boxShadow: "0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,108,255,0.12) inset",
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: "#7c6cff", boxShadow: "0 0 8px rgba(124,108,255,0.7)" }}
                />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white font-syne">Lo que Milo sabe de vos</p>
                <p className="text-[10px] text-[rgba(255,255,255,0.3)]">datos capturados en esta sesión</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[rgba(255,255,255,0.3)] hover:text-white transition-colors p-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5">

            {/* Intent + time row */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: intent.bg, border: `1px solid ${intent.color}25` }}
              >
                <p className="text-[10px] text-[rgba(255,255,255,0.4)] mb-1 uppercase tracking-wider">Intención detectada</p>
                <p className="text-[13px] font-bold" style={{ color: intent.color }}>
                  {intent.label}
                </p>
              </div>
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="text-[10px] text-[rgba(255,255,255,0.4)] mb-1 uppercase tracking-wider">Tiempo en sitio</p>
                <p className="text-[13px] font-bold text-white">
                  {formatTime(context.timeOnSite)}
                </p>
              </div>
            </div>

            {/* Device + hour */}
            <div className="grid grid-cols-3 gap-3">
              <div
                className="rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="text-[10px] text-[rgba(255,255,255,0.4)] mb-1">Dispositivo</p>
                <p className="text-[12px] font-semibold text-white capitalize">{context.device}</p>
              </div>
              <div
                className="rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="text-[10px] text-[rgba(255,255,255,0.4)] mb-1">Hora local</p>
                <p className="text-[12px] font-semibold text-white">{context.localHour}:00hs</p>
              </div>
              <div
                className="rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="text-[10px] text-[rgba(255,255,255,0.4)] mb-1">Visita</p>
                <p className="text-[12px] font-semibold text-white">
                  {context.isReturnVisitor ? "Retorno 🔄" : "Primera"}
                </p>
              </div>
            </div>

            {/* Sections visited */}
            {sections.length > 0 && (
              <div>
                <p className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-3">
                  Secciones visitadas
                </p>
                <div className="space-y-2.5">
                  {sections.slice(0, 5).map(([key, val]) => {
                    const pct = Math.round((val.time / maxTime) * 100);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-[rgba(255,255,255,0.7)]">
                            {SECTION_LABELS[key] ?? key}
                            {val.revisits > 0 && (
                              <span className="ml-1.5 text-[9px] text-[rgba(124,108,255,0.8)]">
                                ↩ {val.revisits}x
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-[rgba(255,255,255,0.4)]">{formatTime(val.time)}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${pct}%`,
                              background: "linear-gradient(90deg, #7c6cff, #a78bfa)",
                              transitionDelay: "200ms",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer note */}
            <div
              className="rounded-xl px-4 py-3 text-center"
              style={{ background: "rgba(124,108,255,0.08)", border: "1px solid rgba(124,108,255,0.15)" }}
            >
              <p className="text-[11px] text-[rgba(200,194,255,0.8)] leading-relaxed">
                Esto es lo que Meetzy captura de <strong>cada visitante</strong> en tu web — sin que hagan nada.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes panel-in {
          from { opacity: 0; transform: translate(-50%, -42%); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </>
  );
}
