"use client";

import { useEffect, useState } from "react";

interface AnalyticsData {
  today: number;
  week: number;
  month: number;
  total: number;
  avgMessages: number;
  topQuestions: string[];
}

export default function AnalyticsPanel({ siteId }: { siteId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sites/${siteId}/analytics`)
      .then((r) => r.json())
      .then((d) => setData(d as AnalyticsData))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [siteId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 shimmer h-24" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const metrics = [
    { label: "Hoy", value: data.today, icon: "📊" },
    { label: "7 días", value: data.week, icon: "📅" },
    { label: "30 días", value: data.month, icon: "🗓️" },
    { label: "Mensajes promedio", value: data.avgMessages, icon: "💬" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
            <p className="text-xl mb-1">{m.icon}</p>
            <p className="font-syne font-bold text-2xl text-[#F0EDE8]">{m.value}</p>
            <p className="text-xs text-[#6b6b6b] mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {data.topQuestions.length > 0 && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
          <h3 className="font-syne font-bold text-base text-[#F0EDE8] mb-4">
            Top preguntas (últimos 30 días)
          </h3>
          <div className="space-y-3">
            {data.topQuestions.map((q, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-[#a0a0a0]">{q}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
