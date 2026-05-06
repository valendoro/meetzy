"use client";

import Link from "next/link";
import { useState } from "react";

interface SiteCardProps {
  site: {
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
    _count: { conversations: number };
  };
}

export default function SiteCard({ site }: SiteCardProps) {
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
      if (res.ok) setActive(!active);
    } finally {
      setToggling(false);
    }
  }

  function copyScript() {
    const script = `<script>
  window.MEETZYCONFIG = { siteId: "${site.siteId}" };
</script>
<script src="${process.env.NEXT_PUBLIC_APP_URL ?? "https://app.meetzy.ai"}/widget.js" async></script>`;
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const planColors: Record<string, string> = {
    starter: "text-[#6b6b6b] bg-[#1a1a1a] border-[#222]",
    pro: "text-accent bg-accent/10 border-accent/30",
    elite: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  };

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 hover:border-[#2a2a2a] transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-syne font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: site.brandColor }}
          >
            {initials}
          </div>
          <div>
            <h3 className="font-syne font-bold text-sm text-[#F0EDE8] truncate max-w-[140px]">
              {site.name}
            </h3>
            <p className="text-xs text-[#6b6b6b] truncate max-w-[140px]">
              {site.url.replace(/^https?:\/\//, "")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${
              planColors[site.plan] ?? planColors.starter
            }`}
          >
            {site.plan}
          </span>

          <button
            onClick={toggleActive}
            disabled={toggling}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              active ? "bg-accent" : "bg-[#333]"
            } ${toggling ? "opacity-50" : ""}`}
            title={active ? "Pausar" : "Activar"}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                active ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-4 mb-5 p-3 bg-[#0e0e0e] rounded-xl">
        <div className="text-center flex-1">
          <p className="font-syne font-bold text-lg text-[#F0EDE8]">
            {site.conversationsToday}
          </p>
          <p className="text-[10px] text-[#6b6b6b]">hoy</p>
        </div>
        <div className="w-px h-6 bg-[#1e1e1e]" />
        <div className="text-center flex-1">
          <p className="font-syne font-bold text-lg text-[#F0EDE8]">
            {site._count.conversations}
          </p>
          <p className="text-[10px] text-[#6b6b6b]">total</p>
        </div>
        <div className="w-px h-6 bg-[#1e1e1e]" />
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500" : "bg-[#444]"}`}
            />
            <p className="text-xs text-[#6b6b6b]">{active ? "Activo" : "Pausado"}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/${site.siteId}`}
          className="flex-1 text-center text-xs font-medium text-[#F0EDE8] border border-[#222] px-3 py-2 rounded-lg hover:border-[#444] transition-colors"
        >
          Ver detalles
        </Link>
        <button
          onClick={copyScript}
          className={`flex-1 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
            copied
              ? "bg-green-500/10 text-green-400 border border-green-500/30"
              : "bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20"
          }`}
        >
          {copied ? "¡Copiado!" : "Copiar script"}
        </button>
      </div>
    </div>
  );
}
