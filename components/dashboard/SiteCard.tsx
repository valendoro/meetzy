"use client";

import Link from "next/link";
import { useState } from "react";
import { Clipboard, ExternalLink, LayoutDashboard } from "lucide-react";
import DeleteSiteButton from "@/components/dashboard/DeleteSiteButton";
import { useProductToast } from "@/components/providers/product-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const INTENT_SEGMENTS: { key: string; color: string }[] = [
  { key: "exploring", color: "var(--intent-exploring)" },
  { key: "interested", color: "var(--intent-interested)" },
  { key: "evaluating", color: "var(--intent-evaluating)" },
  { key: "ready_to_buy", color: "var(--intent-ready)" },
  { key: "hot_lead", color: "var(--intent-hot)" },
];

const INTENT_BADGE: Record<string, { label: string; tone: string }> = {
  hot_lead: { label: "Hot lead", tone: "border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] text-[#F87171]" },
  ready_to_buy: { label: "Listo", tone: "border-[rgba(249,115,22,0.3)] bg-[rgba(249,115,22,0.07)] text-[#FB923C]" },
  evaluating: { label: "Evaluando", tone: "border-[rgba(234,179,8,0.3)] bg-[rgba(234,179,8,0.07)] text-[#FBBF24]" },
  interested: { label: "Interés", tone: "border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.07)] text-[#60A5FA]" },
  exploring: { label: "Explorando", tone: "border-[var(--border-default)] bg-[#334155]/40 text-[#94A3B8]" },
};

export interface SiteCardModel {
  id: string;
  siteId: string;
  name: string;
  url: string;
  plan: string;
  isActive: boolean;
  agentName: string;
  brandColor: string;
  avatarType: string | null;
  avatarImageUrl: string | null;
  conversationsToday: number;
  conversationsWeek: number;
  conversationsMonth: number;
  intentMix: { intentLabel: string; count: number }[];
  _count: { conversations: number };
}

export default function SiteCard({ site }: { site: SiteCardModel }) {
  const { push } = useProductToast();
  const [copyLabel, setCopyLabel] = useState("Script");
  const [active, setActive] = useState(site.isActive);
  const [toggling, setToggling] = useState(false);

  const initials = site.agentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function toggleActive() {
    setToggling(true);
    try {
      const res = await fetch(`/api/sites/${site.siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !active }),
      });
      if (res.ok) {
        const next = !active;
        setActive(next);
        push(next ? "Agente activado" : "Agente pausado", "success");
      } else {
        push("No se pudo actualizar el estado. Intentá de nuevo.", "error");
      }
    } catch {
      push("Error de red al actualizar el estado.", "error");
    } finally {
      setToggling(false);
    }
  }

  async function copyScript() {
    const script = `<!-- Meetzy -->
<script>
  window.MEETZYCONFIG = { siteId: "${site.siteId}" };
</script>
<script src="${process.env.NEXT_PUBLIC_APP_URL ?? "https://app.meetzy.ai"}/widget.js" async></script>`;
    try {
      await navigator.clipboard.writeText(script);
      setCopyLabel("✓ Copiado");
      push("Código copiado", "success");
      window.setTimeout(() => {
        setCopyLabel("Script");
      }, 2000);
    } catch {
      push("No se pudo copiar. Revisá los permisos del navegador.", "error");
    }
  }

  const plan = site.plan.toLowerCase();
  const intentTotal = site.intentMix.reduce((a, b) => a + b.count, 0) || 1;
  const topIntent = site.intentMix.reduce<{ intentLabel: string; count: number } | null>(
    (best, cur) => (!best || cur.count > best.count ? cur : best),
    null,
  );
  const intentBadge = topIntent ? (INTENT_BADGE[topIntent.intentLabel] ?? INTENT_BADGE.exploring) : INTENT_BADGE.exploring;
  const cleanUrl = site.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <article className="product-site-card flex flex-col overflow-hidden p-0">
      {/* Card header — 60px */}
      <header
        className="flex h-[80px] items-center gap-4 border-b border-[var(--border-subtle)] px-6"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, ${site.brandColor} 8%, transparent), transparent 60%)`,
        }}
      >
        {/* Avatar 40px */}
        <div
          className="relative flex size-[40px] shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] font-mono text-[12px] font-bold text-white"
        >
          {site.avatarImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.avatarImageUrl} alt="" className="mz-avatar-img size-full object-contain" />
          ) : (
            <span
              style={{ backgroundColor: site.brandColor }}
              className="flex size-full items-center justify-center font-mono tracking-tight"
            >
              {initials}
            </span>
          )}
        </div>

        {/* Name + URL */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-syne text-[14px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
            {site.agentName}
          </h3>
          <p className="truncate font-mono text-[11px] text-[var(--text-tertiary)]">{cleanUrl}</p>
        </div>

        {/* Right: plan badge + toggle */}
        <div className="flex shrink-0 items-center gap-2">
          {plan === "elite" ? (
            <Badge className="border border-amber-500/30 bg-amber-500/08 px-1.5 py-0.5 text-[10px] font-medium normal-case text-amber-400">
              elite
            </Badge>
          ) : plan === "pro" ? (
            <Badge variant="accent" className="px-1.5 py-0.5 text-[10px] font-medium normal-case">
              pro
            </Badge>
          ) : (
            <Badge variant="default" className="px-1.5 py-0.5 text-[10px] font-medium normal-case">
              starter
            </Badge>
          )}
          <button
            type="button"
            onClick={() => void toggleActive()}
            disabled={toggling}
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 ${
              active ? "bg-[var(--accent)]" : "bg-[var(--bg-overlay)]"
            } ${toggling ? "opacity-50" : ""} border border-[var(--border-default)] dash-focus-ring`}
            title={active ? "Pausar" : "Activar"}
          >
            <span
              className={`absolute top-0.5 size-3.5 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out ${
                active ? "translate-x-[18px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </header>

      {/* Metrics row */}
      <div className="grid grid-cols-3 divide-x divide-[var(--border-subtle)] px-0 py-0">
        <div className="px-5 py-5 text-center">
          <p className="font-mono text-[22px] font-medium tabular-nums leading-tight text-[var(--text-primary)]">
            {site.conversationsToday}
          </p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Hoy</p>
        </div>
        <div className="px-5 py-5 text-center">
          <p className="font-mono text-[22px] font-medium tabular-nums leading-tight text-[var(--text-primary)]">
            {site.conversationsWeek}
          </p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">7 días</p>
        </div>
        <div className="flex flex-col items-center justify-center px-5 py-5">
          <span
            className={`rounded-[4px] border px-1.5 py-0.5 text-[10px] font-medium ${intentBadge.tone}`}
          >
            {topIntent?.intentLabel === "hot_lead" && (
              <span className="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-[#F87171] align-middle" />
            )}
            {intentBadge.label}
          </span>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Intent</p>
        </div>
      </div>

      {/* Intent bar */}
      <div className="px-6 pb-5">
        <div className="flex h-1 w-full overflow-hidden rounded-full bg-[var(--bg-overlay)]">
          {INTENT_SEGMENTS.map(({ key, color }) => {
            const row = site.intentMix.find((i) => i.intentLabel === key);
            const pct = ((row?.count ?? 0) / intentTotal) * 100;
            if (pct <= 0) return null;
            return (
              <div
                key={key}
                className="h-full min-w-px transition-all duration-300"
                style={{ width: `${pct}%`, backgroundColor: color }}
                title={`${key}: ${row?.count ?? 0}`}
              />
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-[var(--border-subtle)] px-6 py-4">
        <div className="flex items-center gap-1">
          <span
            className={`size-1.5 rounded-full ${active ? "bg-[var(--success)]" : "bg-[var(--text-tertiary)]"}`}
            style={active ? { boxShadow: "0 0 6px var(--success)" } : {}}
          />
          <p className="font-mono text-[11px] text-[var(--text-tertiary)]">
            {site._count.conversations > 0
              ? `${site._count.conversations} conv total`
              : "Sin conversaciones"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void copyScript()}
            className="h-7 gap-1 rounded-[var(--radius-sm)] px-2 text-[11px] text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          >
            <Clipboard className="size-3" strokeWidth={2} />
            {copyLabel}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 gap-1 rounded-[var(--radius-sm)] px-2 text-[11px]"
            asChild
          >
            <Link href={`/dashboard/${site.siteId}`}>
              <LayoutDashboard className="size-3" />
              Dashboard
            </Link>
          </Button>
        </div>
      </footer>

      {/* Bottom: live site + delete */}
      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-6 py-3.5">
        <a
          href={site.url.startsWith("http") ? site.url : `https://${site.url}`}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 items-center gap-1 truncate font-mono text-[11px] text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
        >
          <ExternalLink className="size-3 shrink-0 opacity-80" />
          <span className="truncate">Sitio en vivo</span>
        </a>
        <DeleteSiteButton
          siteId={site.siteId}
          siteName={site.name}
          variant="card"
          className="font-mono text-[11px] text-[var(--error)]/70 hover:text-[var(--error)] hover:underline"
        />
      </div>
    </article>
  );
}
