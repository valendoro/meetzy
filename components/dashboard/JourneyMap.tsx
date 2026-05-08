"use client";

export default function JourneyMap({
  journey,
}: {
  journey: { section: string; seconds: number }[];
}) {
  if (!journey.length) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">Sin datos de recorrido en la última visita.</p>
    );
  }

  const path = journey;

  return (
    <div className="relative overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
      <ol className="flex min-w-min items-stretch gap-0">
        {path.map((j, i) => (
          <li key={`${j.section}-${i}`} className="flex min-w-0 items-center">
            {i > 0 ? (
              <span
                className="mx-1 shrink-0 text-lg font-light text-[var(--text-tertiary)]"
                aria-hidden
              >
                →
              </span>
            ) : null}
            <div className="flex min-w-0 flex-col items-center gap-1">
              <span className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-overlay)] px-3 py-2 text-center text-sm font-medium capitalize text-[var(--text-primary)] shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
                {j.section}
              </span>
              <span className="text-[10px] font-medium tabular-nums text-[var(--text-secondary)]">
                {Math.round(j.seconds)}s
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
