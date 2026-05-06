"use client";

import type { IntentLabel } from "@/lib/intent-scorer";

const STYLES: Record<
  IntentLabel,
  { bg: string; text: string; pulse?: boolean }
> = {
  exploring: { bg: "rgba(148,163,184,0.2)", text: "#94A3B8" },
  interested: { bg: "rgba(59,130,246,0.2)", text: "#60A5FA" },
  evaluating: { bg: "rgba(234,179,8,0.2)", text: "#FBBF24" },
  ready_to_buy: { bg: "rgba(249,115,22,0.2)", text: "#FB923C" },
  hot_lead: { bg: "rgba(239,68,68,0.2)", text: "#F87171", pulse: true },
};

const LABELS_ES: Record<IntentLabel, string> = {
  exploring: "Explorando",
  interested: "Interesado",
  evaluating: "Evaluando",
  ready_to_buy: "Listo para comprar",
  hot_lead: "Hot lead",
};

function normalize(label: string): IntentLabel {
  if (label in STYLES) return label as IntentLabel;
  return "exploring";
}

export default function IntentBadge({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  const k = normalize(label);
  const s = STYLES[k];
  const text = LABELS_ES[k];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide backdrop-blur-sm ${s.pulse ? "animate-pulse" : ""} ${className}`}
      style={{
        backgroundColor: s.bg,
        color: s.text,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      }}
    >
      {text}
    </span>
  );
}
