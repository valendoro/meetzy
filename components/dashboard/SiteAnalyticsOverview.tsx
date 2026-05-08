"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import MetricCard from "./MetricCard";
import RecentConversationsPreview from "./RecentConversationsPreview";
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

const ACCENT = "#6366f1";

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
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    borderRadius: 8,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
  },
  labelStyle: { color: "var(--text-primary)", fontWeight: 500, fontFamily: "DM Sans, sans-serif", fontSize: 12 } satisfies CSSProperties,
  itemStyle: { color: "var(--text-secondary)", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 12 } satisfies CSSProperties,
};

export default function SiteAnalyticsOverview({
  siteId,
  siteName,
  siteUrl,
  appUrl,
  initialIsActive,
  brandColor,
}: {
  siteId: string;
  siteName: string;
  siteUrl: string;
  appUrl: string;
  initialIsActive: boolean;
  brandColor: string;
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
    <div className="space-y-12">
      <div className="dash-hero flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-syne text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">
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
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
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
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="dash-skeleton h-36" />
          ))}
        </div>
      ) : null}

      {data ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Sesiones"
              value={data.sessions.total}
              change={data.sessions.change}
              sub="Conversaciones iniciadas en este periodo."
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              }
            />
            <MetricCard
              title="Páginas / sesión"
              value={data.avgPagesVisited.value}
              change={data.avgPagesVisited.change}
              sub="Profundidad promedio de navegación."
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
              }
            />
            <MetricCard
              title="Duración media"
              value={formatDurationSec(data.avgDuration.value)}
              change={data.avgDuration.change}
              sub="Tiempo promedio por conversación."
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 7 12 12 15.5 14" />
                </svg>
              }
            />
            <MetricCard
              title="Hot leads"
              value={data.hotLeads.total}
              change={data.hotLeads.change}
              sub="Visitantes con intención alta de compra."
              highlight="hot"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
                </svg>
              }
            />
          </div>

          <div className="grid gap-7 lg:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 transition-colors duration-150 hover:border-[var(--border-default)]">
              <h3 className="dash-chart-head">Sesiones por día</h3>
              <div className="h-72 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.sessions.byDay} margin={{ top: 6, right: 6, left: -18, bottom: 4 }}>
                    <defs>
                      <linearGradient id="meetzySessionsArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                      </linearGradient>
                    </defs>
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
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={ACCENT}
                      strokeWidth={2.5}
                      fill="url(#meetzySessionsArea)"
                      dot={false}
                      activeDot={{ r: 5, fill: ACCENT, stroke: "#fff", strokeWidth: 1 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 transition-colors duration-150 hover:border-[var(--border-default)]">
              <h3 className="dash-chart-head">Distribución de intención</h3>
              {donutData.length === 0 ? (
                <div className="dash-empty py-14">
                  <div className="flex justify-center mb-4">
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--accent-subtle)", border: "1px solid rgba(99,102,241,0.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
                    Cuando el widget reciba tráfico, vas a ver cómo se distribuyen tus visitantes por nivel de
                    intención.
                  </p>
                </div>
              ) : (
                <div className="h-72 w-full min-w-0">
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

          <div className="grid gap-7 lg:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 transition-colors duration-150 hover:border-[var(--border-default)]">
              <h3 className="dash-chart-head">Conversaciones recientes</h3>
              <RecentConversationsPreview siteId={siteId} brandColor={brandColor} />
              <Link
                href={`/dashboard/${siteId}/conversations`}
                className="mt-4 inline-flex min-h-10 items-center text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                Ver todas →
              </Link>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 transition-colors duration-150 hover:border-[var(--border-default)]">
              <h3 className="dash-chart-head">Top preguntas</h3>
              {!data.topQuestions?.length ? (
                <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-overlay)] px-4 py-8 text-center">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Estamos agrupando las preguntas con IA (caché ~1h). Si acabás de instalar, pasá unos minutos o
                    abrí <strong className="text-[var(--text-primary)]">Analytics</strong>.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {data.topQuestions.slice(0, 5).map((q, i) => (
                    <li
                      key={i}
                      className="flex gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-3 py-2.5 text-sm transition-colors hover:border-[rgba(99,102,241,0.35)]"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-xs font-bold text-[var(--text-primary)] ring-1 ring-[rgba(99,102,241,0.22)]">
                        {i + 1}
                      </span>
                      <span className="text-[var(--text-secondary)] leading-snug">
                        {q.question}
                        <span className="ml-2 whitespace-nowrap font-semibold text-[var(--text-tertiary)] tabular-nums">
                          ×{q.count}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid gap-7 lg:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 transition-colors duration-150 hover:border-[var(--border-default)]">
              <h3 className="dash-chart-head">Países</h3>
                {!data.countries.length ? (
                  <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                    Aparecen cuando tengamos país por IP o por el widget.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {data.countries.map((c) => (
                      <li
                        key={c.country}
                        className="flex justify-between gap-3 rounded-[var(--radius-md)] py-2 text-sm border-b border-[var(--border-subtle)] last:border-0"
                      >
                        <span className="text-[var(--text-primary)]">
                          {(c.flag ?? countryFlagEmoji(c.country)) + " " + c.country}
                        </span>
                        <span className="font-semibold tabular-nums text-[var(--text-secondary)]">{c.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 transition-colors duration-150 hover:border-[var(--border-default)]">
                <h3 className="dash-chart-head">Fuentes</h3>
                {!data.sources.length ? (
                  <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                    UTM y referrer se van a ir llenando con el tráfico real.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {data.sources.map((s) => (
                      <li
                        key={s.source}
                        className="flex justify-between gap-3 rounded-[var(--radius-md)] py-2 text-sm border-b border-[var(--border-subtle)] capitalize last:border-0"
                      >
                        <span className="text-[var(--text-primary)]">{s.source}</span>
                        <span className="font-semibold tabular-nums text-[var(--text-secondary)]">{s.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
        </>
      ) : !loading ? (
        <div className="dash-empty">
          <div className="flex justify-center mb-4">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5"/>
              </svg>
            </div>
          </div>
          <p className="text-[var(--text-primary)] font-medium mb-1">No se pudieron cargar las métricas</p>
          <p className="text-sm text-[var(--text-secondary)]">Revisá tu conexión o volvé a intentar en unos segundos.</p>
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
