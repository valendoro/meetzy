"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import MetricCard from "./MetricCard";
import { formatDurationSec } from "@/lib/format-duration";
import { countryFlagEmoji } from "@/lib/country-flag";
import { useProductToast } from "@/components/providers/product-toast";

type Range = "today" | "7d" | "30d" | "all";

interface AnalyticsPayload {
  range: Range;
  sessions: { total: number; change: number; byDay: { date: string; count: number }[] };
  avgDuration: { value: number; change: number };
  avgPagesVisited: { value: number; change: number };
  hotLeads: { total: number; change: number };
  intentDistribution: Record<string, number>;
  countries: { country: string; count: number; flag?: string }[];
  sources: { source: string; count: number }[];
  topQuestions: { question: string; count: number }[];
}

const ACCENT = "#7c6cff";

const INTENT_COLORS: Record<string, string> = {
  exploring: "#94A3B8",
  interested: "#60A5FA",
  evaluating: "#FBBF24",
  ready_to_buy: "#FB923C",
  hot_lead: "#F87171",
};

const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "all", label: "Todo" },
];

const tooltipProps = {
  contentStyle: {
    background: "rgba(22, 21, 31, 0.97)",
    border: "1px solid rgba(124, 108, 255, 0.22)",
    borderRadius: 12,
    boxShadow: "0 16px 48px rgba(0, 0, 0, 0.45)",
  },
  labelStyle: { color: "var(--c-text)", fontWeight: 600 },
  itemStyle: { color: "rgba(243, 241, 236, 0.72)" },
};

export default function SiteAnalyticsOverview({
  siteId,
  siteName,
  siteUrl,
  appUrl,
  initialIsActive,
}: {
  siteId: string;
  siteName: string;
  siteUrl: string;
  appUrl: string;
  initialIsActive: boolean;
}) {
  const { push } = useProductToast();
  const [range, setRange] = useState<Range>("7d");
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [copied, setCopied] = useState(false);
  const [toggling, setToggling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/analytics?range=${range}`);
      if (!res.ok) throw new Error("fetch");
      const json = (await res.json()) as AnalyticsPayload;
      setData(json);
      if (!json.topQuestions?.length) {
        void fetch(`/api/sites/${siteId}/analytics/top-questions`, { method: "POST" }).then(() => {
          void fetch(`/api/sites/${siteId}/analytics?range=${range}`)
            .then((r) => r.json())
            .then((j: AnalyticsPayload) => setData(j))
            .catch(() => {});
        });
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [siteId, range]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleActive = async () => {
    setToggling(true);
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        const j = (await res.json()) as { site: { isActive: boolean } };
        setIsActive(j.site.isActive);
        push(j.site.isActive ? "Agente activo" : "Agente pausado", "success");
      } else {
        push("No se pudo cambiar el estado", "error");
      }
    } catch {
      push("Error de red", "error");
    } finally {
      setToggling(false);
    }
  };

  const copyScript = async () => {
    const script = `<!-- Meetzy -->
<script>
  window.MEETZYCONFIG = { siteId: "${siteId}" };
</script>
<script src="${appUrl}/widget.js" async></script>`;
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      push("Script copiado", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      push("No se pudo copiar el script", "error");
    }
  };

  const donutData = data
    ? Object.entries(data.intentDistribution)
        .filter(([, v]) => (v ?? 0) > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  const displayUrl = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="space-y-10">
      <div className="dash-hero flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-syne text-xl font-bold tracking-tight text-[color:var(--c-text)] sm:text-2xl">
              {siteName}
            </h2>
            <span className={isActive ? "dash-status-live" : "dash-status-live dash-status-live--off"}>
              <i aria-hidden />
              {isActive ? "En vivo" : "Pausado"}
            </span>
          </div>
          <a
            href={siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-[color:var(--c-muted)] transition-colors hover:text-[color:var(--c-accent)]"
          >
            <span className="truncate">{displayUrl}</span>
            <span className="shrink-0 text-[0.7rem] opacity-60" aria-hidden>
              ↗
            </span>
          </a>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="dash-segmented" role="group" aria-label="Rango de fechas">
            {RANGE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                data-active={range === o.value ? "true" : "false"}
                onClick={() => setRange(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void toggleActive()}
              disabled={toggling}
              className="btn-ghost btn-ghost--sm"
            >
              {isActive ? "Pausar" : "Activar"}
            </button>
            <button type="button" onClick={() => void copyScript()} className="btn-ghost btn-ghost--sm">
              {copied ? "¡Copiado!" : "Copiar script"}
            </button>
            <Link href={`/dashboard/${siteId}/visitors`} className="btn-primary text-sm" style={{ padding: "0.5rem 1rem" }}>
              Visitantes
            </Link>
          </div>
        </div>
      </div>

      {loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="dash-skeleton h-32" />
          ))}
        </div>
      ) : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Sesiones"
              value={data.sessions.total}
              change={data.sessions.change}
              sub="Conversaciones iniciadas en este periodo."
              icon="📈"
            />
            <MetricCard
              title="Páginas / sesión"
              value={data.avgPagesVisited.value}
              change={data.avgPagesVisited.change}
              sub="Profundidad promedio de navegación."
              icon="📑"
            />
            <MetricCard
              title="Duración media"
              value={formatDurationSec(data.avgDuration.value)}
              change={data.avgDuration.change}
              sub="Tiempo promedio por conversación."
              icon="⏱"
            />
            <MetricCard
              title="Hot leads"
              value={data.hotLeads.total}
              change={data.hotLeads.change}
              sub="Visitantes con intención alta de compra."
              highlight="hot"
              icon="🔥"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="dash-card p-5 pl-6">
              <h3 className="dash-chart-head">Sesiones por día</h3>
              <div className="h-64 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.sessions.byDay} margin={{ top: 6, right: 6, left: -18, bottom: 4 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "rgba(243,241,236,0.35)", fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    />
                    <YAxis
                      tick={{ fill: "rgba(243,241,236,0.35)", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      width={32}
                    />
                    <Tooltip
                      {...tooltipProps}
                      formatter={(v) => [Number(v ?? 0), "Sesiones"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={ACCENT}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: ACCENT, stroke: "#fff", strokeWidth: 1 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="dash-card p-5 pl-6">
              <h3 className="dash-chart-head">Distribución de intención</h3>
              {donutData.length === 0 ? (
                <div className="dash-empty py-14">
                  <p className="text-3xl mb-3" aria-hidden>
                    🎯
                  </p>
                  <p className="text-sm text-[color:var(--c-muted)] max-w-xs mx-auto">
                    Cuando el widget reciba tráfico, vas a ver cómo se distribuyen tus visitantes por nivel de
                    intención.
                  </p>
                </div>
              ) : (
                <div className="h-64 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={92}
                        paddingAngle={2.5}
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth={1}
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`c-${index}`} fill={INTENT_COLORS[entry.name] ?? ACCENT} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipProps} formatter={(v) => [Number(v ?? 0), "Visitantes"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="dash-card p-5 pl-6">
              <h3 className="dash-chart-head">Top preguntas</h3>
              {!data.topQuestions?.length ? (
                <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--c-border)] bg-[color:var(--c-surface2)]/40 px-4 py-8 text-center">
                  <p className="text-sm text-[color:var(--c-muted)] leading-relaxed">
                    Estamos agrupando las preguntas con IA (caché ~1h). Si acabás de instalar, pasá unos minutos o
                    abrí <strong className="text-[color:var(--c-text)]">Analytics</strong>.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {data.topQuestions.slice(0, 5).map((q, i) => (
                    <li
                      key={i}
                      className="flex gap-3 rounded-[var(--radius-md)] border border-[color:var(--c-border)] bg-[color:var(--c-surface2)]/35 px-3 py-2.5 text-sm transition-colors hover:border-[rgba(124,108,255,0.25)]"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--c-accent-dim)] text-xs font-bold text-[color:var(--c-text)] ring-1 ring-[rgba(124,108,255,0.2)]">
                        {i + 1}
                      </span>
                      <span className="text-[color:var(--c-muted)] leading-snug">
                        {q.question}
                        <span className="ml-2 whitespace-nowrap font-semibold text-[color:var(--c-muted2)] tabular-nums">
                          ×{q.count}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="dash-card p-5 pl-6">
                <h3 className="dash-chart-head">Países</h3>
                {!data.countries.length ? (
                  <p className="text-sm text-[color:var(--c-muted2)] leading-relaxed">
                    Aparecen cuando tengamos país por IP o por el widget.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {data.countries.map((c) => (
                      <li
                        key={c.country}
                        className="flex justify-between gap-3 rounded-[var(--radius-md)] py-2 text-sm border-b border-[color:var(--c-border)]/60 last:border-0"
                      >
                        <span className="text-[color:var(--c-text)]">
                          {(c.flag ?? countryFlagEmoji(c.country)) + " " + c.country}
                        </span>
                        <span className="font-semibold tabular-nums text-[color:var(--c-muted)]">{c.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="dash-card p-5 pl-6">
                <h3 className="dash-chart-head">Fuentes</h3>
                {!data.sources.length ? (
                  <p className="text-sm text-[color:var(--c-muted2)] leading-relaxed">
                    UTM y referrer se van a ir llenando con el tráfico real.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {data.sources.map((s) => (
                      <li
                        key={s.source}
                        className="flex justify-between gap-3 rounded-[var(--radius-md)] py-2 text-sm border-b border-[color:var(--c-border)]/60 capitalize last:border-0"
                      >
                        <span className="text-[color:var(--c-text)]">{s.source}</span>
                        <span className="font-semibold tabular-nums text-[color:var(--c-muted)]">{s.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      ) : !loading ? (
        <div className="dash-empty">
          <p className="text-2xl mb-3" aria-hidden>
            ⚠️
          </p>
          <p className="text-[color:var(--c-text)] font-medium mb-1">No se pudieron cargar las métricas</p>
          <p className="text-sm text-[color:var(--c-muted)]">Revisá tu conexión o volvé a intentar en unos segundos.</p>
          <button
            type="button"
            onClick={() => void load()}
            className="btn-primary mt-6"
            style={{ padding: "0.55rem 1.25rem", fontSize: "0.8125rem" }}
          >
            Reintentar
          </button>
        </div>
      ) : null}
    </div>
  );
}
