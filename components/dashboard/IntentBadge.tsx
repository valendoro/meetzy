"use client";

import type { IntentLabel } from "@/lib/intent-scorer";

const LABELS_ES: Record<IntentLabel, string> = {
  exploring: "Explorando",
  interested: "Interesado",
  evaluating: "Evaluando",
  ready_to_buy: "Listo para comprar",
  hot_lead: "Hot lead",
};

function normalize(label: string): IntentLabel {
  if (label in LABELS_ES) return label as IntentLabel;
  return "exploring";
}

export default function IntentBadge({ label, className = "" }: { label: string; className?: string }) {
  const k = normalize(label);
  const text = LABELS_ES[k];

  const cls: Record<IntentLabel, string> = {
    exploring: "border-transparent bg-[rgba(100,116,139,0.2)] text-[var(--intent-exploring)]",
    interested: "border-transparent bg-[rgba(59,130,246,0.15)] text-[var(--intent-interested)]",
    evaluating: "border-transparent bg-[rgba(234,179,8,0.15)] text-[var(--intent-evaluating)]",
    ready_to_buy: "border-transparent bg-[rgba(249,115,22,0.15)] text-[var(--intent-ready)]",
    hot_lead:
      "intent-badge-hot border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.12)] text-[var(--intent-hot)]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide ${cls[k]} ${className}`}
    >
      {text}
    </span>
  );
}
