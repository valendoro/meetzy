"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AnalyticsData {
  today: number;
  week: number;
  month: number;
  total: number;
  avgMessages: number;
  topQuestions: string[];
  hotLeads?: HotLead[];
  intentDistribution?: { low: number; medium: number; high: number };
}

interface HotLead {
  visitorId: string;
  intentScore: number;
  lastMessage: string;
  signals: string[];
  conversationId: string;
  createdAt: string;
}

function IntentBar({ score }: { score: number }) {
  const pct = Math.min(score * 100, 100);
  const color = pct >= 66 ? "#22c55e" : pct >= 33 ? "#f59e0b" : "#6b6b6b";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-medium" style={{ color }}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}

export default function IntentDashboard({ siteId }: { siteId: string }) {
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
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 shimmer h-24" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const metrics = [
    { label: "Conversaciones hoy", value: data.today, icon: "📊", color: "#6366f1" },
    { label: "Esta semana", value: data.week, icon: "📅", color: "#8b5cf6" },
    { label: "Este mes", value: data.month, icon: "🗓️", color: "#6366f1" },
    { label: "Mensajes promedio", value: data.avgMessages, icon: "💬", color: "#22c55e" },
  ];

  const dist = data.intentDistribution;

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
            <p className="text-xl mb-2">{m.icon}</p>
            <p className="font-syne font-bold text-2xl text-[#F0EDE8]">{m.value}</p>
            <p className="text-xs text-[#6b6b6b] mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Intent distribution */}
        {dist && (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <h3 className="font-syne font-bold text-base text-[#F0EDE8] mb-5">
              Distribución de intención
            </h3>
            <div className="space-y-4">
              {[
                { label: "Alta intención", count: dist.high, color: "#22c55e", desc: "Listo para comprar" },
                { label: "Intención media", count: dist.medium, color: "#f59e0b", desc: "Evaluando opciones" },
                { label: "Explorando", count: dist.low, color: "#6b6b6b", desc: "Solo curiosidad" },
              ].map((item) => {
                const total = dist.high + dist.medium + dist.low || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1.5">
                      <div>
                        <span className="text-sm font-medium text-[#F0EDE8]">{item.label}</span>
                        <span className="text-xs text-[#444] ml-2">{item.desc}</span>
                      </div>
                      <span className="text-sm font-syne font-bold" style={{ color: item.color }}>
                        {item.count}
                      </span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top questions */}
        {data.topQuestions.length > 0 && (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <h3 className="font-syne font-bold text-base text-[#F0EDE8] mb-5">
              Preguntas más frecuentes
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

      {/* Hot leads */}
      {data.hotLeads && data.hotLeads.length > 0 && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-syne font-bold text-base text-[#F0EDE8]">
                🔥 Hot leads
              </h3>
              <p className="text-xs text-[#6b6b6b] mt-0.5">
                Visitantes con alta intención de compra detectada
              </p>
            </div>
            <span className="text-xs text-[#6b6b6b] bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#222]">
              Últimas 48hs
            </span>
          </div>

          <div className="space-y-3">
            {data.hotLeads.map((lead, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 bg-[#0e0e0e] border border-[#1a1a1a] rounded-xl hover:border-[#2a2a2a] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-sm flex-shrink-0">
                  🎯
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-[#F0EDE8]">
                      Visitante {lead.visitorId.slice(-6)}
                    </p>
                    {lead.signals.length > 0 && (
                      <div className="flex gap-1">
                        {lead.signals.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#6b6b6b] truncate mb-2">
                    &ldquo;{lead.lastMessage}&rdquo;
                  </p>
                  <IntentBar score={lead.intentScore} />
                </div>
                <Link
                  href={`/dashboard/${siteId}/conversations`}
                  className="text-xs text-accent hover:underline flex-shrink-0"
                >
                  Ver →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
