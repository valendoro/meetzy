"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const STAGE_LABELS: Record<string, string> = {
  exploring: "Explorando",
  interested: "Interesado",
  evaluating: "Evaluando",
  ready_to_buy: "Listo",
  hot_lead: "Hot lead",
};

export default function FunnelChart({
  funnel,
}: {
  funnel: Record<string, number>;
}) {
  const order = ["exploring", "interested", "evaluating", "ready_to_buy", "hot_lead"];
  const data = order.map((key) => ({
    key,
    stage: STAGE_LABELS[key] ?? key,
    count: funnel[key] ?? 0,
  }));
  return (
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="stage" tick={{ fill: "#9ca3af", fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={48} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "rgba(22, 21, 31, 0.97)",
              border: "1px solid rgba(124, 108, 255, 0.22)",
              borderRadius: 12,
            }}
          />
          <Bar dataKey="count" fill="#7c6cff" radius={[6, 6, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
