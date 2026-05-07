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
  hot_lead: { label: "Hot", tone: "border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.1)] text-[var(--intent-hot)]" },
  ready_to_buy: { label: "Listo", tone: "border-[rgba(249,115,22,0.35)] bg-[rgba(249,115,22,0.08)] text-[var(--intent-ready)]" },
  evaluating: { label: "Evaluando", tone: "border-[rgba(234,179,8,0.35)] bg-[rgba(234,179,8,0.08)] text-[var(--intent-evaluating)]" },
  interested: { label: "Interés", tone: "border-[rgba(59,130,246,0.35)] bg-[rgba(59,130,246,0.08)] text-[var(--intent-interested)]" },
  exploring: { label: "Explorando", tone: "border-[var(--border-default)] bg-[var(--bg-overlay)] text-[var(--intent-exploring)]" },
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
  const [copyLabel, setCopyLabel] = useState("Copiar script");
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
      setCopyLabel("✓ Copiado!");
      push("Código copiado", "success");
      window.setTimeout(() => {
        setCopyLabel("Copiar script");
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

  return (
    <article className="product-site-card flex flex-col overflow-hidden p-0">
      <header
        className="flex h-20 items-center gap-3.5 border-b border-[var(--border-subtle)] px-5"
        style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${site.brandColor} 15%, transparent), transparent)` }}
      >
        <div className="relative flex size-[52px] shrink-0 items-center justify-center overflow-hidden rounded-xl font-syne text-sm font-bold text-white shadow-md">
          {site.avatarImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={site.avatarImageUrl} alt="" className="size-full object-cover" />
          ) : (
            <span style={{ backgroundColor: site.brandColor }} className="flex size-full items-center justify-center">
              {initials}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-syne text-base font-bold tracking-tight text-[var(--text-primary)]">{site.agentName}</h3>
          <p className="truncate text-xs text-[var(--text-tertiary)]">
            {site.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {plan === "elite" ? (
            <Badge className="border border-amber-500/30 bg-amber-500/10 text-[10px] font-normal normal-case text-amber-400">
              {site.plan}
            </Badge>
          ) : plan === "pro" ? (
            <Badge variant="accent" className="text-[10px] font-normal normal-case">
              {site.plan}
            </Badge>
          ) : (
            <Badge variant="default" className="text-[10px] font-normal normal-case">
              {site.plan}
            </Badge>
          )}
          <button
            type="button"
            onClick={() => void toggleActive()}
            disabled={toggling}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ${
              active ? "bg-[var(--accent)]" : "bg-[var(--bg-overlay)]"
            } ${toggling ? "opacity-50" : ""} dash-focus-ring`}
            title={active ? "Pausar" : "Activar"}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-150 ease-out ${
                active ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 px-5 py-4">
        <div className="text-center">
          <p className="font-syne text-2xl font-extrabold tabular-nums tracking-[-0.02em] text-[var(--text-primary)]">
            {site.conversationsToday}
          </p>
          <p className="mt-0.5 text-[11px] font-normal text-[var(--text-tertiary)]">Hoy</p>
        </div>
        <div className="border-x border-[var(--border-subtle)] text-center">
          <p className="font-syne text-2xl font-extrabold tabular-nums tracking-[-0.02em] text-[var(--text-primary)]">
            {site.conversationsWeek}
          </p>
          <p className="mt-0.5 text-[11px] font-normal text-[var(--text-tertiary)]">7 días</p>
        </div>
        <div className="flex flex-col items-center justify-start gap-1.5 text-center">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${intentBadge.tone}`}
          >
            {intentBadge.label}
          </span>
          <p className="text-[11px] font-normal text-[var(--text-tertiary)]">Intent</p>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="flex h-1.5 w-full overflow-hidden rounded-[3px] bg-[var(--bg-overlay)]">
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

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] px-5 py-3">
        <p className="text-[12px] font-light text-[var(--text-tertiary)]">
          {site._count.conversations > 0 ? `${site._count.conversations} conversaciones` : "Sin conversaciones aún"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void copyScript()}
            className="h-8 gap-1 text-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          >
            <Clipboard className="size-3.5" strokeWidth={2} />
            {copyLabel}
          </Button>
          <Button variant="secondary" size="sm" className="h-8 gap-1 text-[12px]" asChild>
            <Link href={`/dashboard/${site.siteId}`}>
              <LayoutDashboard className="size-3.5" />
              Ver dashboard
            </Link>
          </Button>
        </div>
      </footer>

      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-5 py-2">
        <a
          href={site.url.startsWith("http") ? site.url : `https://${site.url}`}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 items-center gap-1 truncate text-[11px] text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
        >
          <ExternalLink className="size-3 shrink-0 opacity-80" />
          <span className="truncate">Sitio en vivo</span>
        </a>
        <DeleteSiteButton
          siteId={site.siteId}
          siteName={site.name}
          variant="card"
          className="text-[11px] text-[var(--error)]/85 hover:text-[var(--error)] hover:underline"
        />
      </div>
    </article>
  );
}
