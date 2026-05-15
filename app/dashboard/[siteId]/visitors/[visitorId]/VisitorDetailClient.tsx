"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import SiteSubnav from "@/components/dashboard/SiteSubnav";
import IntentBadge from "@/components/dashboard/IntentBadge";
import SessionTimeline from "@/components/dashboard/SessionTimeline";
import JourneyMap from "@/components/dashboard/JourneyMap";
import IntentSignalsList from "@/components/dashboard/IntentSignals";
import { useProductToast } from "@/components/providers/product-toast";
import { formatDurationSec } from "@/lib/format-duration";
import { countryFlagEmoji } from "@/lib/country-flag";
import { Mail, CheckCircle, Download, BarChart2, MessageSquare, Clock, TrendingUp, Globe, Monitor } from "lucide-react";
import VisitorNotes from "@/components/dashboard/VisitorNotes";
import type { VisitorProfile } from "@prisma/client";
import type { IntentSignalEntry } from "@/lib/intent-scorer";
import type { ConversationSessionRow } from "@/components/dashboard/SessionTimeline";

interface Payload {
  profile: VisitorProfile;
  conversations: ConversationSessionRow[];
  journey: { section: string; seconds: number }[];
  latestSignals: IntentSignalEntry[];
}

function bigInitials(name: string | null | undefined, email: string | null | undefined, id: string): string {
  if (name?.trim()) {
    const p = name.trim().split(/\s+/);
    return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase().slice(0, 2) || "?";
  }
  if (email?.trim()) return (email[0] + (email[1] ?? "")).toUpperCase();
  return id.slice(-2).toUpperCase();
}

export default function VisitorDetailClient({
  sitePublicId,
  siteName,
  visitorId,
}: {
  sitePublicId: string;
  siteName: string;
  visitorId: string;
}) {
  const { push } = useProductToast();
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacted, setContacted] = useState(false);

  useEffect(() => {
    void (async () => {
      const r = await fetch(`/api/sites/${sitePublicId}/visitors/${visitorId}`);
      if (r.ok) setData((await r.json()) as Payload);
      setLoading(false);
    })();
  }, [sitePublicId, visitorId]);

  const markContacted = async () => {
    try {
      const r = await fetch(`/api/sites/${sitePublicId}/visitors/${visitorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markContacted: true }),
      });
      if (!r.ok) { push("No se pudo actualizar el perfil", "error"); return; }
      setContacted(true);
      push("Marcado como contactado ✓", "success");
    } catch {
      push("Error de red", "error");
    }
  };

  const exportProfile = () => {
    if (!data) return;
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `visitante-${visitorId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      push("Perfil exportado (JSON)", "success");
    } catch {
      push("No se pudo exportar", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SiteSubnav siteId={sitePublicId} siteName={siteName} active="visitors" pageTitle="Perfil" />
        <div className="dash-skeleton h-52 rounded-[var(--radius-xl)]" />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="dash-skeleton h-64 rounded-[var(--radius-lg)]" />
          <div className="dash-skeleton h-64 rounded-[var(--radius-lg)]" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <SiteSubnav siteId={sitePublicId} siteName={siteName} active="visitors" pageTitle="Perfil" />
        <div className="dash-empty dash-empty--page">
          <p className="text-3xl mb-4" aria-hidden>◌</p>
          <h3 className="font-syne text-lg font-bold text-[var(--text-primary)] mb-2">Visitante no encontrado</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            El ID no coincide con ningún perfil en este sitio.
          </p>
          <Link href={`/dashboard/${sitePublicId}/visitors`} className="btn-primary mt-6 inline-block" style={{ padding: "0.6rem 1.1rem", fontSize: "0.8rem" }}>
            Volver a visitantes
          </Link>
        </div>
      </div>
    );
  }

  const { profile, conversations, journey, latestSignals } = data;
  const latest = conversations[0];
  const emailTo = profile.email ?? latest?.visitorEmail;

  const barData = journey
    .filter((j) => j.seconds > 0)
    .map((j) => ({ section: j.section, sec: Math.round(j.seconds) }))
    .sort((a, b) => b.sec - a.sec);

  const tooltipStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    borderRadius: "8px",
    fontSize: "12px",
    color: "var(--text-primary)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
  };

  const stats = [
    { icon: <TrendingUp className="size-3.5" />, label: "Score", value: `${profile.maxIntentScore} pts` },
    { icon: <BarChart2 className="size-3.5" />, label: "Visitas", value: String(profile.totalVisits) },
    { icon: <MessageSquare className="size-3.5" />, label: "Mensajes", value: String(profile.totalMessages) },
    { icon: <Clock className="size-3.5" />, label: "Tiempo total", value: formatDurationSec(profile.totalTime) },
  ];

  return (
    <div className="space-y-6">
      <SiteSubnav siteId={sitePublicId} siteName={siteName} active="visitors" pageTitle="Perfil" />

      {/* Hero card */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
        {/* Color bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent-border)] to-transparent opacity-60" />

        <div className="p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Avatar */}
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--accent-subtle)] font-syne text-[22px] font-bold text-[var(--accent)] ring-1 ring-[var(--accent-border)]">
              {bigInitials(profile.name, profile.email, profile.visitorId)}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5 mb-1">
                <h1 className="font-syne text-[22px] font-bold tracking-tight text-[var(--text-primary)]">
                  {profile.name?.trim() || "Visitante anónimo"}
                </h1>
                <IntentBadge label={profile.maxIntentLabel} />
                {contacted && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                    <CheckCircle className="size-3" /> Contactado
                  </span>
                )}
              </div>

              {profile.email && (
                <p className="text-[13px] text-[var(--text-secondary)] mb-0.5">{profile.email}</p>
              )}
              {profile.company && (
                <p className="text-[13px] text-[var(--text-secondary)] mb-0.5">{profile.company}</p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-[var(--text-tertiary)]">
                {profile.country && (
                  <span className="flex items-center gap-1">
                    <Globe className="size-3" />
                    {countryFlagEmoji(profile.country)} {profile.country}
                  </span>
                )}
                {latest?.device && (
                  <span className="flex items-center gap-1">
                    <Monitor className="size-3" />
                    {latest.device}
                  </span>
                )}
                {profile.topSource && (
                  <span className="capitalize">📍 {profile.topSource}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
              {emailTo && (
                <a
                  href={`mailto:${emailTo}`}
                  className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--accent)] px-3.5 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <Mail className="size-3.5" />
                  Contactar
                </a>
              )}
              <button
                type="button"
                onClick={() => void markContacted()}
                className="flex items-center gap-1.5 btn-ghost btn-ghost--sm"
              >
                <CheckCircle className="size-3.5" />
                Marcar contactado
              </button>
              <button
                type="button"
                onClick={exportProfile}
                className="flex items-center gap-1.5 btn-ghost btn-ghost--sm"
              >
                <Download className="size-3.5" />
                Exportar JSON
              </button>
            </div>
          </div>

          {/* Stats grid */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-3.5 py-3">
                <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] mb-1">
                  {s.icon}
                  <span className="text-[10px] font-semibold uppercase tracking-wider">{s.label}</span>
                </div>
                <p className="font-syne text-[18px] font-bold text-[var(--text-primary)]">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Timeline */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
          <h2 className="dash-chart-head">Timeline de actividad</h2>
          <p className="mb-4 text-[11px] text-[var(--text-tertiary)]">Historial de sesiones y conversaciones.</p>
          <SessionTimeline conversations={conversations} />
        </div>

        {/* Right col */}
        <div className="space-y-5">
          {/* Sections bar */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
            <h2 className="dash-chart-head">Secciones visitadas</h2>
            <p className="mb-4 text-[11px] text-[var(--text-tertiary)]">Tiempo acumulado por sección (última sesión).</p>
            {barData.length === 0 ? (
              <p className="text-[13px] text-[var(--text-secondary)]">Sin datos de sección aún.</p>
            ) : (
              <div className="h-48 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: 4, right: 12 }}>
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="section"
                      width={88}
                      tick={{ fill: "rgba(243, 241, 236, 0.38)", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [`${String(value ?? 0)}s`, "Tiempo"]}
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    />
                    <Bar dataKey="sec" fill="var(--accent)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Journey map */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
            <h2 className="dash-chart-head">Journey map</h2>
            <p className="mb-4 text-[11px] text-[var(--text-tertiary)]">Orden de navegación por sección.</p>
            <JourneyMap journey={journey} />
          </div>
        </div>
      </div>

      {/* Intent signals */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
        <h2 className="dash-chart-head">Señales de intent</h2>
        <p className="mb-4 text-[11px] text-[var(--text-tertiary)]">Factores que determinaron el score de intención (última sesión).</p>
        <IntentSignalsList signals={latestSignals} totalScore={latest?.intentScore ?? profile.maxIntentScore} />
      </div>

      {/* Notes */}
      <VisitorNotes sitePublicId={sitePublicId} visitorId={visitorId} />
    </div>
  );
}
