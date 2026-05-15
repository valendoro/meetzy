"use client";

import { useCallback, useEffect, useState } from "react";
import SiteSubnav from "@/components/dashboard/SiteSubnav";
import FunnelChart from "@/components/dashboard/FunnelChart";
import HeatmapChart from "@/components/dashboard/HeatmapChart";
import TopQuestions from "@/components/dashboard/TopQuestions";
import { useProductToast } from "@/components/providers/product-toast";
import { formatDurationSec } from "@/lib/format-duration";
import { Download, RefreshCw } from "lucide-react";
import Link from "next/link";
import IntentBadge from "@/components/dashboard/IntentBadge";

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

const SOURCE_ICONS: Record<string, string> = {
  google:    "🔍",
  instagram: "📸",
  facebook:  "👥",
  linkedin:  "💼",
  twitter:   "🐦",
  referral:  "🔗",
  direct:    "🌐",
};

function intentColor(score: number): string {
  if (score >= 70) return "text-[#f97316]";
  if (score >= 45) return "text-[var(--accent)]";
  return "text-[var(--text-tertiary)]";
}

function isAnalyticsQuiet(d: AnalyticsResponse): boolean {
  return (
    Object.values(d.funnel).reduce((a, b) => a + b, 0) === 0 &&
    d.hourlyHeatmap.flat().reduce((a, b) => a + b, 0) === 0 &&
    d.trafficSources.reduce((a, t) => a + t.sessions, 0) === 0
  );
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
      if (r.ok) { setData((await r.json()) as AnalyticsResponse); return true; }
      push("No se pudieron cargar las métricas", "error");
      return false;
    } catch {
      push("Error de red al cargar analytics", "error");
      return false;
    } finally {
      setLoading(false);
    }
  }, [sitePublicId, range, push]);

  useEffect(() => { void load(); }, [load]);

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
      if (!r.ok) { push("No se pudo actualizar el resumen de preguntas", "error"); return; }
      const ok = await load();
      if (ok) push("Clusters de preguntas actualizados", "success");
    } catch { push("Error de red", "error"); }
    finally { setQLoading(false); }
  };

  return (
    <div className="space-y-6">
      <SiteSubnav siteId={sitePublicId} siteName={siteName} active="analytics" pageTitle="Analytics" />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        <a
          href={`/api/sites/${sitePublicId}/emails?format=csv`}
          download
          className="btn-ghost btn-ghost--sm flex items-center gap-1.5"
          onClick={() => push("Descargando CSV…", "info")}
        >
          <Download className="size-3.5" />
          Exportar emails
        </a>
      </div>

      {loading && !data ? (
        <div className="space-y-5">
          <div className="dash-skeleton h-40 w-full rounded-[var(--radius-lg)]" />
          <div className="dash-skeleton h-64 w-full rounded-[var(--radius-lg)]" />
          <div className="dash-skeleton h-52 w-full rounded-[var(--radius-lg)]" />
        </div>
      ) : data ? (
        <div className={`space-y-5 transition-opacity ${loading ? "pointer-events-none opacity-50" : ""}`}>

          {isAnalyticsQuiet(data) && (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-elevated)] p-8 text-center">
              <p className="mb-2 font-syne text-base font-bold text-[var(--text-primary)]">Sin actividad en este período</p>
              <p className="mx-auto max-w-lg text-[13px] leading-relaxed text-[var(--text-secondary)]">
                Probá otro rango o revisá la{" "}
                <Link href={`/dashboard/${sitePublicId}/install`} className="font-medium text-[var(--accent)] hover:underline">
                  instalación del widget
                </Link>.
              </p>
            </div>
          )}

          {/* Preguntas frecuentes */}
          <TopQuestions
            siteId={sitePublicId}
            items={data.topQuestions}
            onRegenerate={regenerateQuestions}
            loading={qLoading}
          />

          {/* Heatmap */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
            <h2 className="dash-chart-head">Mapa de calor horario</h2>
            <p className="mb-4 text-[11px] text-[var(--text-tertiary)]">Hora del día × día de semana — intensidad de sesiones.</p>
            <HeatmapChart matrix={data.hourlyHeatmap} />
          </div>

          {/* Funnel */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
            <h2 className="dash-chart-head">Embudo de intención</h2>
            <p className="mb-4 text-[11px] text-[var(--text-tertiary)]">Basado en el máximo de intención por visitante único.</p>
            <FunnelChart funnel={data.funnel} />
          </div>

          {/* Traffic sources */}
          {data.trafficSources.length > 0 && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
              <h2 className="dash-chart-head">Fuentes de tráfico</h2>
              <div className="mt-3 space-y-2">
                {(() => {
                  const max = Math.max(...data.trafficSources.map((t) => t.sessions), 1);
                  return data.trafficSources.map((t) => (
                    <div key={t.source} className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base">{SOURCE_ICONS[t.source] ?? "🌐"}</span>
                          <span className="text-[13px] font-medium capitalize text-[var(--text-primary)]">{t.source}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[12px] text-[var(--text-secondary)] shrink-0">
                          <span><span className="font-semibold text-[var(--text-primary)]">{t.sessions}</span> sesiones</span>
                          <span className={`font-semibold tabular-nums ${intentColor(t.avgIntent)}`}>{t.avgIntent} pts</span>
                          <span className="text-[var(--text-tertiary)]">{formatDurationSec(t.avgDuration)}</span>
                        </div>
                      </div>
                      {/* Bar */}
                      <div className="mt-2.5 h-1 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                          style={{ width: `${Math.round((t.sessions / max) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="dash-skeleton h-48 w-full rounded-[var(--radius-lg)]" />
      )}

      {/* Emails capturados */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="dash-chart-head mb-0">Emails capturados{emails.length > 0 && <span className="ml-2 text-[var(--accent)]">({emails.length})</span>}</h2>
          {emails.length > 0 && (
            <a
              href={`/api/sites/${sitePublicId}/emails?format=csv`}
              download
              className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--accent)] hover:underline"
            >
              <Download className="size-3" />
              CSV
            </a>
          )}
        </div>
        {!emails.length ? (
          <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--bg-overlay)] px-4 py-6 text-center">
            <p className="text-[13px] text-[var(--text-secondary)]">
              Cuando un visitante deje su email en el chat aparecerá acá con su intent y score.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {emails.map((e, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[10px] font-bold text-[var(--accent)]">
                    {(e.name?.[0] ?? e.email?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium text-[var(--text-primary)]">{e.email}</p>
                    {e.name && <p className="text-[11px] text-[var(--text-tertiary)]">{e.name}{e.company ? ` · ${e.company}` : ""}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <IntentBadge label={e.intentLabel} />
                  <span className="text-[11px] tabular-nums text-[var(--text-tertiary)]">{e.intentScore} pts</span>
                  {e.email && (
                    <a
                      href={`mailto:${e.email}`}
                      className="text-[11px] font-medium text-[var(--accent)] hover:underline"
                    >
                      Escribir →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
