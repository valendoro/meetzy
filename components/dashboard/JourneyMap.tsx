"use client";

export default function JourneyMap({
  journey,
}: {
  journey: { section: string; seconds: number }[];
}) {
  if (!journey.length) {
    return (
      <p className="text-sm text-[color:var(--c-muted)]">Sin datos de recorrido en la última visita.</p>
    );
  }

  const path = journey;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--c-text)]">
        {path.map((j, i) => (
          <span key={`${j.section}-${i}`} className="flex items-center gap-2">
            {i > 0 ? <span className="text-[color:var(--c-muted2)]">→</span> : null}
            <span className="rounded-lg border border-[color:var(--c-border)] bg-[color:var(--c-surface2)] px-2.5 py-1 capitalize">
              {j.section}
              <span className="ml-1 text-xs text-[color:var(--c-muted)]">({Math.round(j.seconds)}s)</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
