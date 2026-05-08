"use client";

import { useCallback, useEffect, useState } from "react";
import SiteSubnav from "@/components/dashboard/SiteSubnav";
import FunnelChart from "@/components/dashboard/FunnelChart";
import HeatmapChart from "@/components/dashboard/HeatmapChart";
import TopQuestions from "@/components/dashboard/TopQuestions";
import { useProductToast } from "@/components/providers/product-toast";
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

function isAnalyticsQuiet(d: AnalyticsResponse): boolean {
  const funnelSum = Object.values(d.funnel).reduce((a, b) => a + b, 0);
  const heatSum = d.hourlyHeatmap.flat().reduce((a, b) => a + b, 0);
  const trafficSum = d.trafficSources.reduce((a, t) => a + t.sessions, 0);
  return funnelSum === 0 && heatSum === 0 && trafficSum === 0;
}

export default function AnalyticsPageClient({
  sitePublicId,
  siteName,
}: {
  sitePublicId: string;
  siteName: string;
}) {
  const { push } = useProductToast();
  const [range, setRange] = useState<Range>("30d");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [qLoading, setQLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const r = await fetch(`/api/sites/${sitePublicId}/analytics?range=${range}`);
      if (r.ok) {
        setData((await r.json()) as AnalyticsResponse);
        return true;
      }
      push("No se pudieron cargar las métricas", "error");
      return false;
    } catch {
      push("Error de red al cargar analytics", "error");
      return false;
    } finally {
      setLoading(false);
    }
  }, [sitePublicId, range, push]);

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
      const r = await fetch(`/api/sites/${sitePublicId}/analytics/top-questions`, { method: "POST" });
      if (!r.ok) {
        push("No se pudo actualizar el resumen de preguntas", "error");
        return;
      }
      const ok = await load();
      if (ok) push("Clusters de preguntas actualizados", "success");
    } catch {
      push("Error de red", "error");
    } finally {
      setQLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <SiteSubnav siteId={sitePublicId} siteName={siteName} active="analytics" pageTitle="Analytics" />

      <div className="dash-hero flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
            Periodo
          </p>
          <p className="mt-1 font-syne text-lg font-bold text-[var(--text-primary)]">Insights profundos</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="dash-segmented" role="group" aria-label="Rango">
            {(["today", "7d", "30d", "all"] as const).map((r) => (
              <button
                key={r}
                type="button"
                data-active={range === r ? "true" : "false"}
                onClick={() => setRange(r)}
              >
                {r === "today" ? "Hoy" : r === "7d" ? "7 días" : r === "30d" ? "30 días" : "Todo"}
              </button>
            ))}
          </div>
          <Link
            href={`/api/sites/${sitePublicId}/emails?format=csv`}
            target="_blank"
            className="btn-ghost btn-ghost--sm"
            onClick={() => push("Descarga de CSV en curso…", "info")}
          >
            Exportar CSV
          </Link>
        </div>
      </div>

      {loading && !data ? (
        <div className="space-y-6">
          <div className="dash-skeleton h-40 w-full" />
          <div className="dash-skeleton h-64 w-full" />
          <div className="dash-skeleton h-52 w-full" />
        </div>
      ) : data ? (
        <>
          <div className={loading ? "pointer-events-none opacity-55 transition-opacity" : ""}>
            {isAnalyticsQuiet(data) ? (
              <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-elevated)] p-8 text-center">
                <p className="mb-2 font-syne text-base font-bold text-[var(--text-primary)]">Sin actividad en este período</p>
                <p className="mx-auto max-w-lg text-sm leading-relaxed text-[var(--text-secondary)]">
                  Cuando haya visitas con el widget instalado, vas a ver calor horario, embudo de intención y fuentes. Probá
                  otro rango o revisá la{" "}
                  <Link href={`/dashboard/${sitePublicId}/install`} className="font-medium text-[var(--accent)] hover:underline">
                    instalación
                  </Link>
                  .
                </p>
              </div>
            ) : null}

            <TopQuestions
              siteId={sitePublicId}
              items={data.topQuestions}
              onRegenerate={regenerateQuestions}
              loading={qLoading}
            />

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
            <h2 className="dash-chart-head">Mapa de calor</h2>
            <p className="-mt-2 mb-4 text-xs text-[var(--text-tertiary)]">Hora del día × día de la semana (sesiones).</p>
            <HeatmapChart matrix={data.hourlyHeatmap} />
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
            <h2 className="dash-chart-head">Embudo de intención</h2>
            <p className="-mt-2 mb-4 text-xs text-[var(--text-tertiary)]">
              Basado en el máximo de intención por visitante (perfiles).
            </p>
            <FunnelChart funnel={data.funnel} />
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
            <h2 className="dash-chart-head">Fuentes de tráfico</h2>
            <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-overlay)]">
              <table className="dash-inner-table w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr>
                    <th className="px-5 py-4 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Fuente
                    </th>
                    <th className="px-5 py-4 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Sesiones
                    </th>
                    <th className="px-5 py-4 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Intent promedio
                    </th>
                    <th className="px-5 py-4 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Duración media (s)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.trafficSources.map((t) => (
                    <tr key={t.source}>
                      <td className="px-5 py-4 capitalize text-[var(--text-primary)]">{t.source}</td>
                      <td className="px-5 py-4 tabular-nums text-[var(--text-secondary)]">{t.sessions}</td>
                      <td className="px-5 py-4 tabular-nums text-[var(--text-secondary)]">{t.avgIntent}</td>
                      <td className="px-5 py-4 tabular-nums text-[var(--text-secondary)]">{t.avgDuration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        </>
      ) : (
        <div className="dash-skeleton h-48 w-full" />
      )}

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
        <h2 className="dash-chart-head">Emails capturados</h2>
        {!emails.length ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-overlay)] px-4 py-8 text-center">
            <p className="mx-auto max-w-lg text-sm leading-relaxed text-[var(--text-secondary)]">
              Cuando un visitante deje su correo en el chat (captura en el flujo del agente), vas a verlo listado acá con
              intención y score. Revisá la{" "}
              <Link href={`/dashboard/${sitePublicId}/settings`} className="font-medium text-[var(--accent)] hover:underline">
                configuración del agente
              </Link>{" "}
              para el tono y reglas.
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {emails.map((e, i) => (
              <li
                key={i}
                className="flex flex-wrap justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-3 py-2.5 text-sm"
              >
                <span className="font-medium text-[var(--text-primary)]">{e.email}</span>
                <span className="text-[var(--text-secondary)]">
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

