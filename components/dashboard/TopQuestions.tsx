"use client";

import Link from "next/link";
import { RefreshCw, Sparkles } from "lucide-react";

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
  const maxCount = Math.max(...items.map((q) => q.count), 1);

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="dash-chart-head mb-0">Preguntas frecuentes</h2>
          {items.length > 0 && (
            <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-overlay)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-tertiary)]">
              {items.length}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {onRegenerate ? (
            <button
              type="button"
              disabled={loading}
              onClick={onRegenerate}
              className="btn-ghost btn-ghost--sm flex items-center gap-1.5 disabled:opacity-45"
            >
              <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Actualizando…" : "Actualizar IA"}
            </button>
          ) : null}
          <Link
            href={`/dashboard/${siteId}/settings`}
            className="btn-ghost btn-ghost--sm flex items-center gap-1.5"
          >
            <Sparkles className="size-3 text-[var(--accent)]" />
            Mejorar prompt
          </Link>
        </div>
      </div>

      {!items.length ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-overlay)] px-4 py-8 text-center">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="size-5 animate-spin text-[var(--text-tertiary)]" />
              <p className="text-[13px] text-[var(--text-secondary)]">Agrupando preguntas con IA…</p>
            </div>
          ) : (
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              Todavía no hay clusters. Enviá tráfico al widget o tocá{" "}
              <strong className="text-[var(--text-primary)]">Actualizar IA</strong>.
            </p>
          )}
        </div>
      ) : (
        <ol className="space-y-1.5">
          {items.slice(0, 10).map((q, i) => (
            <li
              key={i}
              className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-overlay)] transition-colors hover:border-[rgba(99,102,241,0.35)]"
            >
              <div className="flex gap-3 px-3 py-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[10px] font-bold text-[var(--accent)] ring-1 ring-[rgba(99,102,241,0.22)]">
                  {i + 1}
                </span>
                <span className="flex-1 text-[12px] text-[var(--text-secondary)] leading-snug">
                  {q.question}
                </span>
                <span className="shrink-0 self-start text-[11px] font-semibold tabular-nums text-[var(--text-tertiary)]">
                  ×{q.count}
                </span>
              </div>
              {/* frequency bar */}
              <div className="h-[2px] bg-[var(--bg-surface)]">
                <div
                  className="h-full bg-[var(--accent)] opacity-40 transition-all duration-500"
                  style={{ width: `${Math.round((q.count / maxCount) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
