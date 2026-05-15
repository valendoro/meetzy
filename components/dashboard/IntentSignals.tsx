"use client";

import type { IntentSignalEntry } from "@/lib/intent-scorer";

export default function IntentSignalsList({ signals, totalScore }: { signals: IntentSignalEntry[]; totalScore: number }) {
  if (!signals.length) {
    return (
      <p className="text-[13px] text-[var(--text-secondary)]">
        Todavía no hay señales fuertes registradas para esta sesión.
      </p>
    );
  }

  const maxPoints = Math.max(...signals.map((s) => s.points), 1);

  function scoreColor(score: number): string {
    if (score >= 70) return "from-[#f97316] to-[#ef4444]";
    if (score >= 45) return "from-[var(--accent)] to-[var(--accent)]";
    return "from-[#3b82f6] to-[#6366f1]";
  }

  return (
    <div className="space-y-4">
      {/* Score bar */}
      <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
            Score total
          </span>
          <span className="font-syne text-[22px] font-bold text-[var(--text-primary)] tabular-nums">
            {totalScore}
            <span className="text-[13px] font-normal text-[var(--text-tertiary)]">/100</span>
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-[var(--bg-surface)]">
          <div
            className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${scoreColor(totalScore)}`}
            style={{ width: `${Math.min(100, totalScore)}%` }}
          />
        </div>
      </div>

      {/* Signals list */}
      <ul className="space-y-2">
        {signals.map((s) => (
          <li
            key={`${s.id}-${s.label}`}
            className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-3.5 py-2.5"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-start gap-2 min-w-0">
                <span className="mt-0.5 shrink-0 text-emerald-400 text-[12px] leading-none" aria-hidden>✓</span>
                <span className="text-[12px] text-[var(--text-secondary)] leading-snug">{s.label}</span>
              </div>
              <span className="shrink-0 rounded-[4px] bg-[var(--accent-subtle)] border border-[var(--accent-border)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent)] tabular-nums">
                +{s.points}
              </span>
            </div>
            {/* Mini bar */}
            <div className="h-1 rounded-full overflow-hidden bg-[var(--bg-surface)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] opacity-50 transition-all duration-500"
                style={{ width: `${Math.round((s.points / maxPoints) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
