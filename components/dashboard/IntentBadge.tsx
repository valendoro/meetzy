"use client";

import type { IntentLabel } from "@/lib/intent-scorer";

const LABELS_ES: Record<IntentLabel, string> = {
  exploring: "Explorando",
  interested: "Interesado",
  evaluating: "Evaluando",
  ready_to_buy: "Listo",
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
    exploring: "border-[rgba(100,116,139,0.25)] bg-[#334155]/30 text-[#94A3B8]",
    interested: "border-[rgba(59,130,246,0.25)] bg-[rgba(59,130,246,0.07)] text-[#60A5FA]",
    evaluating: "border-[rgba(234,179,8,0.25)] bg-[rgba(234,179,8,0.07)] text-[#FBBF24]",
    ready_to_buy: "border-[rgba(249,115,22,0.25)] bg-[rgba(249,115,22,0.07)] text-[#FB923C]",
    hot_lead: "border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.07)] text-[#F87171]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[4px] border px-2 py-0.5 text-[11px] font-medium tracking-wide ${cls[k]} ${className}`}
    >
      {k === "hot_lead" && (
        <span className="inline-block size-1.5 animate-pulse rounded-full bg-[#F87171]" />
      )}
      {text}
    </span>
  );
}
