"use client";

export default function JourneyMap({
  journey,
}: {
  journey: { section: string; seconds: number }[];
}) {
  if (!journey.length) {
    return (
      <p className="text-[13px] text-[var(--text-secondary)]">Sin datos de recorrido en la última visita.</p>
    );
  }

  const maxSec = Math.max(...journey.map((j) => j.seconds), 1);

  return (
    <div className="relative overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-color:rgba(99,102,241,0.25)_transparent]">
      <ol className="flex min-w-min items-end gap-0 pb-0.5">
        {journey.map((j, i) => {
          const pct = Math.round((j.seconds / maxSec) * 100);
          const isHot = j.seconds === maxSec && j.seconds > 0;

          return (
            <li key={`${j.section}-${i}`} className="flex min-w-0 items-end">
              {i > 0 ? (
                <span
                  className="mx-1 mb-4 shrink-0 text-[var(--text-tertiary)] opacity-50"
                  aria-hidden
                >
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                    <path d="M1 5h12M8 1l6 4-6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              ) : null}
              <div className="flex min-w-0 flex-col items-center gap-1.5">
                {/* Time badge */}
                <span
                  className={`text-[10px] font-medium tabular-nums transition-colors ${
                    isHot ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"
                  }`}
                >
                  {Math.round(j.seconds)}s
                </span>

                {/* Step pill */}
                <div
                  className={`relative rounded-[var(--radius-md)] border px-3 py-2 text-center text-[12px] font-medium capitalize transition-colors shadow-[0_2px_12px_rgba(0,0,0,0.18)] ${
                    isHot
                      ? "border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--text-primary)]"
                      : "border-[var(--border-default)] bg-[var(--bg-overlay)] text-[var(--text-secondary)]"
                  }`}
                >
                  {j.section}
                  {/* Heat bar at bottom of pill */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-[var(--radius-md)] overflow-hidden"
                  >
                    <div
                      className="h-full bg-[var(--accent)] opacity-60 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Step number */}
                <span className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)] opacity-60">
                  {i + 1}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
