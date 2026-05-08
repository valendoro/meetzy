"use client";

import Link from "next/link";

export default function TopQuestions({
  siteId,
  items,
  onRegenerate,
  loading,
}: {
  siteId: string;
  items: { question: string; count: number }[];
  onRegenerate?: () => void;
  loading?: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="dash-chart-head mb-0">Preguntas frecuentes</h2>
        <div className="flex flex-wrap gap-2">
          {onRegenerate ? (
            <button
              type="button"
              disabled={loading}
              onClick={onRegenerate}
              className="btn-ghost btn-ghost--sm disabled:opacity-45"
            >
              {loading ? "…" : "Actualizar IA"}
            </button>
          ) : null}
          <Link href={`/dashboard/${siteId}/settings`} className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}>
            Mejorar prompt
          </Link>
        </div>
      </div>
      {!items.length ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-overlay)] px-4 py-8 text-center">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Todavía no hay clusters. Enviá tráfico al widget o tocá <strong className="text-[var(--text-primary)]">Actualizar IA</strong>.
          </p>
        </div>
      ) : (
        <ol className="space-y-2">
          {items.slice(0, 10).map((q, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-3 py-2.5 text-sm transition-colors hover:border-[rgba(99,102,241,0.35)]"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-xs font-bold text-[var(--text-primary)] ring-1 ring-[rgba(99,102,241,0.22)]">
                {i + 1}
              </span>
              <span className="text-[var(--text-secondary)] leading-snug">
                {q.question}{" "}
                <span className="ml-1 font-semibold tabular-nums text-[var(--text-tertiary)]">×{q.count}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
