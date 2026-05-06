"use client";

import { useCallback, useEffect, useState } from "react";
import SiteSubnav from "@/components/dashboard/SiteSubnav";
import FunnelChart from "@/components/dashboard/FunnelChart";
import HeatmapChart from "@/components/dashboard/HeatmapChart";
import TopQuestions from "@/components/dashboard/TopQuestions";
import Link from "next/link";

type Range = "today" | "7d" | "30d" | "all";

interface AnalyticsResponse {
  range: Range;
  funnel: Record<string, number>;
  hourlyHeatmap: number[][];
  trafficSources: { source: string; sessions: number; avgIntent: number; avgDuration: number }[];
  topQuestions: { question: string; count: number }[];
}

interface EmailRow {
  email: string | null;
  name: string | null;
  company: string | null;
  intentScore: number;
  intentLabel: string;
  capturedAt: string;
}

export default function AnalyticsPageClient({
  sitePublicId,
  siteName,
}: {
  sitePublicId: string;
  siteName: string;
}) {
  const [range, setRange] = useState<Range>("30d");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [qLoading, setQLoading] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch(`/api/sites/${sitePublicId}/analytics?range=${range}`);
    if (r.ok) setData((await r.json()) as AnalyticsResponse);
  }, [sitePublicId, range]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void (async () => {
      const r = await fetch(`/api/sites/${sitePublicId}/emails`);
      if (r.ok) {
        const j = (await r.json()) as { items: EmailRow[] };
        setEmails(j.items);
      }
    })();
  }, [sitePublicId]);

  const regenerateQuestions = async () => {
    setQLoading(true);
    try {
      await fetch(`/api/sites/${sitePublicId}/analytics/top-questions`, { method: "POST" });
      await load();
    } finally {
      setQLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <SiteSubnav siteId={sitePublicId} siteName={siteName} active="analytics" pageTitle="Analytics" />

      <div className="dash-hero flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--c-muted)]">
            Periodo
          </p>
          <p className="mt-1 font-syne text-lg font-bold text-[color:var(--c-text)]">Insights profundos</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="dash-segmented" role="group" aria-label="Rango">
            {(["7d", "30d", "all"] as const).map((r) => (
              <button
                key={r}
                type="button"
                data-active={range === r ? "true" : "false"}
                onClick={() => setRange(r)}
              >
                {r === "7d" ? "7 días" : r === "30d" ? "30 días" : "Todo"}
              </button>
            ))}
          </div>
          <Link
            href={`/api/sites/${sitePublicId}/emails?format=csv`}
            target="_blank"
            className="btn-ghost btn-ghost--sm"
          >
            Exportar CSV
          </Link>
        </div>
      </div>

      {data ? (
        <>
          <TopQuestions
            siteId={sitePublicId}
            items={data.topQuestions}
            onRegenerate={regenerateQuestions}
            loading={qLoading}
          />

          <div className="dash-card p-5 pl-6">
            <h2 className="dash-chart-head">Mapa de calor</h2>
            <p className="-mt-2 mb-4 text-xs text-[color:var(--c-muted2)]">Hora del día × día de la semana (sesiones).</p>
            <HeatmapChart matrix={data.hourlyHeatmap} />
          </div>

          <div className="dash-card p-5 pl-6">
            <h2 className="dash-chart-head">Embudo de intención</h2>
            <p className="-mt-2 mb-4 text-xs text-[color:var(--c-muted)]">
              Basado en el máximo de intención por visitante (perfiles).
            </p>
            <FunnelChart funnel={data.funnel} />
          </div>

          <div className="dash-card p-5 pl-6">
            <h2 className="dash-chart-head">Fuentes de tráfico</h2>
            <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[color:var(--c-border)]/60 bg-[color:var(--c-surface2)]/25">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-[color:var(--c-muted2)]">
                      Fuente
                    </th>
                    <th className="px-4 py-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-[color:var(--c-muted2)]">
                      Sesiones
                    </th>
                    <th className="px-4 py-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-[color:var(--c-muted2)]">
                      Intent promedio
                    </th>
                    <th className="px-4 py-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-[color:var(--c-muted2)]">
                      Duración media (s)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.trafficSources.map((t) => (
                    <tr key={t.source}>
                      <td className="px-4 py-3 capitalize text-[color:var(--c-text)]">{t.source}</td>
                      <td className="px-4 py-3 tabular-nums text-[color:var(--c-muted)]">{t.sessions}</td>
                      <td className="px-4 py-3 tabular-nums text-[color:var(--c-muted)]">{t.avgIntent}</td>
                      <td className="px-4 py-3 tabular-nums text-[color:var(--c-muted)]">{t.avgDuration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="dash-skeleton h-48 w-full" />
      )}

      <div className="dash-card p-5 pl-6">
        <h2 className="dash-chart-head">Emails capturados</h2>
        {!emails.length ? (
          <p className="text-sm text-[color:var(--c-muted)] leading-relaxed">
            Cuando alguien deje su correo en el chat, vas a verlo acá con contexto de intención.
          </p>
        ) : (
          <ul className="space-y-1">
            {emails.map((e, i) => (
              <li
                key={i}
                className="flex flex-wrap justify-between gap-2 rounded-[var(--radius-md)] border border-[color:var(--c-border)]/50 bg-[color:var(--c-surface2)]/30 px-3 py-2.5 text-sm"
              >
                <span className="font-medium text-[color:var(--c-text)]">{e.email}</span>
                <span className="text-[color:var(--c-muted)]">
                  {e.name ?? "—"} · {e.intentScore} · {e.intentLabel}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
