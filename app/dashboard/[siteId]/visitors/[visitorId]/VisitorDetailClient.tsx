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
      if (!r.ok) {
        push("No se pudo actualizar el perfil", "error");
        return;
      }
      push("Marcado como contactado", "success");
      const refetch = await fetch(`/api/sites/${sitePublicId}/visitors/${visitorId}`);
      if (refetch.ok) setData((await refetch.json()) as Payload);
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
        <div className="dash-skeleton h-44" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="dash-skeleton h-72" />
          <div className="dash-skeleton h-72" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <SiteSubnav siteId={sitePublicId} siteName={siteName} active="visitors" pageTitle="Perfil" />
        <div className="dash-empty">
          <p className="text-3xl mb-4" aria-hidden>
            ◌
          </p>
          <h3 className="font-syne text-lg font-bold text-[color:var(--c-text)] mb-2">Visitante no encontrado</h3>
          <p className="text-sm text-[color:var(--c-muted)] max-w-md mx-auto leading-relaxed">
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
  const barData = journey
    .filter((j) => j.seconds > 0)
    .map((j) => ({ section: j.section, sec: Math.round(j.seconds) }))
    .sort((a, b) => b.sec - a.sec);

  const emailTo = profile.email ?? latest?.visitorEmail;

  const tooltipStyle = {
    background: "rgba(22, 21, 31, 0.96)",
    border: "1px solid rgba(124, 108, 255, 0.22)",
    borderRadius: "12px",
    fontSize: "12px",
    color: "var(--c-text)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
  };

  return (
    <div className="space-y-8">
      <SiteSubnav siteId={sitePublicId} siteName={siteName} active="visitors" pageTitle="Perfil" />

      <div className="dash-hero flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[color:var(--c-accent-dim)] font-syne text-2xl font-bold text-[color:var(--c-text)] ring-1 ring-[rgba(124,108,255,0.22)]">
          {bigInitials(profile.name, profile.email, profile.visitorId)}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-syne text-2xl font-bold tracking-tight text-[color:var(--c-text)]">
              {profile.name?.trim() || "Visitante anónimo"}
            </h1>
            <IntentBadge label={profile.maxIntentLabel} />
          </div>
          {profile.email ? <p className="text-sm text-[color:var(--c-muted)]">{profile.email}</p> : null}
          {profile.company ? <p className="text-sm text-[color:var(--c-muted)]">{profile.company}</p> : null}
          <p className="text-sm text-[color:var(--c-muted2)]">
            {profile.totalVisits} visitas · {profile.totalMessages} mensajes ·{" "}
            {formatDurationSec(profile.totalTime)} en total
          </p>
          <p className="text-xs text-[color:var(--c-muted2)]">
            {(profile.country ? countryFlagEmoji(profile.country) + " " + profile.country : "País desconocido") +
              (latest?.device ? ` · ${latest.device}` : "")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {emailTo ? (
          <a href={`mailto:${emailTo}`} className="btn-primary" style={{ padding: "0.55rem 1rem", fontSize: "0.8125rem" }}>
            Contactar por email
          </a>
        ) : null}
        <button type="button" onClick={() => void markContacted()} className="btn-ghost btn-ghost--sm">
          Marcar como contactado
        </button>
        <button type="button" onClick={exportProfile} className="btn-ghost btn-ghost--sm">
          Exportar perfil
        </button>
        <Link href={`/dashboard/${sitePublicId}/analytics`} className="btn-ghost btn-ghost--sm">
          Analytics
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="dash-card p-5 pl-6">
          <h2 className="dash-chart-head">Timeline de actividad</h2>
          <SessionTimeline conversations={conversations} />
        </div>
        <div className="space-y-6">
          <div className="dash-card p-5 pl-6">
            <h2 className="dash-chart-head">Secciones (última sesión)</h2>
            {barData.length === 0 ? (
              <p className="text-sm leading-relaxed text-[color:var(--c-muted)]">Todavía no hay tiempo por sección.</p>
            ) : (
              <div className="h-52 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 8 }}>
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="section"
                      width={100}
                      tick={{ fill: "rgba(243, 241, 236, 0.38)", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [`${String(value ?? 0)}s`, "Tiempo"]}
                    />
                    <Bar dataKey="sec" fill="#7c6cff" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="dash-card p-5 pl-6">
            <h2 className="dash-chart-head">Journey map</h2>
            <JourneyMap journey={journey} />
          </div>
        </div>
      </div>

      <div className="dash-card p-5 pl-6">
        <h2 className="dash-chart-head">Señales de intent (última sesión)</h2>
        <IntentSignalsList signals={latestSignals} totalScore={latest?.intentScore ?? profile.maxIntentScore} />
      </div>
    </div>
  );
}
