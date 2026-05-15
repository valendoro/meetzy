"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

const STAGE_CONFIG: { key: string; label: string; color: string }[] = [
  { key: "exploring",   label: "Explorando",  color: "#94A3B8" },
  { key: "interested",  label: "Interesado",  color: "#60A5FA" },
  { key: "evaluating",  label: "Evaluando",   color: "#FBBF24" },
  { key: "ready_to_buy",label: "Listo",       color: "#FB923C" },
  { key: "hot_lead",    label: "Hot lead",    color: "#F87171" },
];

export default function FunnelChart({ funnel }: { funnel: Record<string, number> }) {
  const data = STAGE_CONFIG.map((s) => ({
    ...s,
    count: funnel[s.key] ?? 0,
  }));

  const total = data.reduce((a, b) => a + b.count, 0) || 1;

  return (
    <div className="space-y-4">
      {/* Bar chart */}
      <div className="h-52 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(238,234,228,0.38)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              interval={0}
            />
            <YAxis
              tick={{ fill: "rgba(238,234,228,0.38)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: 10,
                boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
              }}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              formatter={(v) => [Number(v ?? 0), "Visitantes"]}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend row with mini funnel bars */}
      <div className="space-y-1.5">
        {data.map((s) => {
          const pct = Math.round((s.count / total) * 100);
          return (
            <div key={s.key} className="flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="w-24 shrink-0 text-[11px] text-[var(--text-secondary)]">{s.label}</span>
              <div className="flex-1 overflow-hidden rounded-full bg-[var(--bg-overlay)] h-1.5">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: s.color, opacity: 0.7 }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-[var(--text-tertiary)]">
                {s.count} <span className="opacity-50">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
