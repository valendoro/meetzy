"use client";

import type { ReactNode } from "react";

function Trend({ change }: { change: number }) {
  const up = change >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-[4px] px-1.5 py-0.5 text-[11px] font-medium tabular-nums ${
        up
          ? "bg-[rgba(34,197,94,0.1)] text-[#4ade80]"
          : "bg-[rgba(239,68,68,0.08)] text-[#f87171]"
      }`}
      aria-label={up ? "subió respecto al periodo anterior" : "bajó respecto al periodo anterior"}
    >
      {up ? "↑" : "↓"} {Math.abs(change)}%
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
      className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 transition-colors duration-150 hover:border-[var(--border-default)]"
      style={
        highlight === "hot"
          ? { borderColor: "rgba(239,68,68,0.25)", boxShadow: "0 0 16px rgba(239,68,68,0.06)" }
          : {}
      }
    >
      {/* Left accent line */}
      <div
        className="absolute inset-y-0 left-0 w-[2px] rounded-l-full"
        style={{
          background: highlight === "hot" ? "#F87171" : "var(--accent)",
          opacity: 0.7,
        }}
      />
      <div className="relative z-[1] flex gap-3">
        {icon ? (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--accent)]"
            style={{
              background: "var(--accent-subtle)",
              border: "1px solid var(--accent-border)",
            }}
          >
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[1px] text-[var(--text-tertiary)]">
            {title}
          </p>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <div
              className={`font-mono text-[28px] font-medium leading-none tracking-tight text-[var(--text-primary)] ${
                highlight === "hot" ? "text-[#f87171]" : ""
              }`}
            >
              {value}
            </div>
            {change !== undefined ? <Trend change={change} /> : null}
          </div>
          <p className="mt-2 text-[12px] font-light leading-snug text-[var(--text-tertiary)]">{sub}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
