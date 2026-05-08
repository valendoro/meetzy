"use client";

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function intensity(n: number, max: number): string {
  if (max <= 0) return "rgba(99,102,241,0)";
  const t = n / max;
  const a = 0.12 + t * 0.88;
  return `rgba(99,102,241,${a.toFixed(2)})`;
}

export default function HeatmapChart({ matrix }: { matrix: number[][] }) {
  const flat = matrix.flat();
  const max = Math.max(1, ...flat);

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div
          className="grid gap-0.5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-1 shadow-inner"
          style={{ gridTemplateColumns: `84px repeat(24, minmax(0,1fr))` }}
        >
          <div />
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className="rounded-[4px] bg-[var(--bg-overlay)] py-1.5 text-center text-[10px] font-medium tabular-nums text-[var(--text-tertiary)]"
            >
              {h}
            </div>
          ))}
          {matrix.map((row, d) => (
            <span key={`d-${d}`} className="contents">
              <div className="flex items-center rounded-[6px] bg-[var(--bg-overlay)] px-2.5 py-2 text-xs font-semibold text-[var(--text-secondary)]">
                {DAY_LABELS[d] ?? d}
              </div>
              {row.map((cell, h) => (
                <div
                  key={`${d}-${h}`}
                  title={`${DAY_LABELS[d]} ${h}:00 — ${cell} sesiones`}
                  className="min-h-[20px] min-w-0 rounded-[5px] ring-1 ring-black/20"
                  style={{ backgroundColor: intensity(cell, max) }}
                />
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
