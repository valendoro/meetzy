"use client";

import type { ReactNode } from "react";

function Trend({ change }: { change: number }) {
  const up = change >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[0.6875rem] font-semibold tabular-nums ${
        up ? "bg-emerald-500/12 text-emerald-300" : "bg-rose-500/12 text-rose-300"
      }`}
      aria-label={up ? "subió respecto al periodo anterior" : "bajó respecto al periodo anterior"}
    >
      {up ? "↑" : "↓"}
      {Math.abs(change)}%
    </span>
  );
}

export default function MetricCard({
  title,
  value,
  sub,
  change,
  highlight,
  icon,
  children,
}: {
  title: string;
  value: ReactNode;
  sub: string;
  change?: number;
  highlight?: "hot";
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      className={`dash-card relative p-5 pl-6 ${highlight === "hot" ? "dash-card--hot" : ""}`}
    >
      <div className="relative z-[1] flex gap-4">
        {icon ? (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-lg"
            style={{
              background: "var(--c-accent-dim)",
              border: "1px solid rgba(124, 108, 255, 0.28)",
              boxShadow: "0 0 20px rgba(124, 108, 255, 0.08)",
            }}
          >
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-[color:var(--c-muted)]">
            {title}
          </p>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <div
              className={`font-syne text-3xl font-bold tracking-tight text-[color:var(--c-text)] ${
                highlight === "hot" ? "text-red-300 drop-shadow-[0_0_12px_rgba(248,113,113,0.35)]" : ""
              }`}
            >
              {value}
            </div>
            {change !== undefined ? <Trend change={change} /> : null}
          </div>
          <p className="mt-2 text-[0.8125rem] leading-snug text-[color:var(--c-muted2)]">{sub}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
