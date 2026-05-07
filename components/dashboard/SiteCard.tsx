"use client";

import Link from "next/link";
import { useState } from "react";
import { Clipboard, ExternalLink } from "lucide-react";
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
  conversationsToday: number;
  conversationsWeek: number;
  conversationsMonth: number;
  intentMix: { intentLabel: string; count: number }[];
  _count: { conversations: number };
}

export default function SiteCard({ site }: { site: SiteCardModel }) {
  const { push } = useProductToast();
  const [copied, setCopied] = useState(false);
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
        push(next ? "Agente activo en tu web" : "Agente pausado", "success");
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
      setCopied(true);
      push("Snippet copiado al portapapeles", "success");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      push("No se pudo copiar. Revisá los permisos del navegador.", "error");
    }
  }

  const plan = site.plan.toLowerCase();
  const intentTotal = site.intentMix.reduce((a, b) => a + b.count, 0) || 1;

  return (
    <div className="product-site-card group flex flex-col p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--radius-md)] font-syne text-lg font-extrabold text-white tabular-nums overflow-hidden"
            style={{ backgroundColor: site.brandColor, boxShadow: `0 4px 20px ${site.brandColor}50` }}
          >
            <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%)` }} />
            <span className="relative z-10">{initials}</span>
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-syne text-base font-bold tracking-tight text-[var(--text-primary)]">{site.agentName}</h3>
            <p className="truncate text-sm text-[var(--text-secondary)]">{site.name}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {plan === "elite" ? (
            <Badge className="border border-amber-500/30 bg-amber-500/10 normal-case text-amber-400">{site.plan}</Badge>
          ) : plan === "pro" ? (
            <Badge variant="accent" className="normal-case">
              {site.plan}
            </Badge>
          ) : (
            <Badge variant="default" className="normal-case">
              {site.plan}
            </Badge>
          )}
          <button
            type="button"
            onClick={() => void toggleActive()}
            disabled={toggling}
            className={`relative h-6 w-11 rounded-full transition-colors duration-150 ${
              active ? "bg-[var(--accent)]" : "bg-[var(--bg-overlay)]"
            } ${toggling ? "opacity-50" : ""}`}
            title={active ? "Pausar" : "Activar"}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-150 ${
                active ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="product-stat-rail mb-5 grid grid-cols-3 gap-2 p-3">
        <div className="text-center">
          <p className="font-syne text-xl font-extrabold tabular-nums tracking-tight text-[var(--text-primary)]">{site.conversationsToday}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">Hoy</p>
        </div>
        <div className="border-x border-[var(--border-subtle)] text-center">
          <p className="font-syne text-xl font-extrabold tabular-nums tracking-tight text-[var(--text-primary)]">{site.conversationsWeek}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">7 días</p>
        </div>
        <div className="text-center">
          <p className="font-syne text-xl font-extrabold tabular-nums tracking-tight text-[var(--text-primary)]">{site.conversationsMonth}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">30 días</p>
        </div>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Intent (7 días)</p>
        <div className="flex h-2 w-full overflow-hidden rounded-[var(--radius-full)] bg-[var(--bg-overlay)]">
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

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[var(--border-subtle)] pt-4">
        <a
          href={site.url.startsWith("http") ? site.url : `https://${site.url}`}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 max-w-[55%] items-center gap-1 truncate text-xs text-[var(--accent)] hover:underline"
        >
          <ExternalLink className="size-3.5 shrink-0 opacity-80" />
          <span className="truncate">{site.url.replace(/^https?:\/\//, "")}</span>
        </a>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => void copyScript()} className="gap-1.5">
            <Clipboard className="size-3.5" strokeWidth={2} />
            {copied ? "Copiado" : "Script"}
          </Button>
          <Button size="sm" asChild>
            <Link href={`/dashboard/${site.siteId}`}>Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <DeleteSiteButton
          siteId={site.siteId}
          siteName={site.name}
          variant="card"
          className="text-xs text-[var(--error)]/90 hover:text-[var(--error)] hover:underline"
        />
      </div>
    </div>
  );
}
