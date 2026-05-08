"use client";

import type { IntentSignalEntry } from "@/lib/intent-scorer";

export default function IntentSignalsList({ signals, totalScore }: { signals: IntentSignalEntry[]; totalScore: number }) {
  if (!signals.length) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">
        Todavía no hay señales fuertes registradas para esta sesión.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {signals.map((s) => (
          <li key={`${s.id}-${s.label}`} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
            <span className="text-emerald-400" aria-hidden>
              ✓
            </span>
            <span>
              {s.label}
              <span className="ml-2 text-[var(--text-tertiary)]">(+{s.points})</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="font-syne text-sm font-bold text-[var(--text-primary)]">
        Score total: {totalScore}/100
      </p>
    </div>
  );
}
