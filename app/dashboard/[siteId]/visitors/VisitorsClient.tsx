"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import SiteSubnav from "@/components/dashboard/SiteSubnav";
import IntentBadge from "@/components/dashboard/IntentBadge";
import { formatDurationSec } from "@/lib/format-duration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VisitorProfile } from "@prisma/client";

const PAGE = 20;

function initials(name: string | null | undefined, email: string | null | undefined, id: string): string {
  if (name?.trim()) {
    const p = name.trim().split(/\s+/);
    return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
  }
  if (email?.trim()) return email[0]?.toUpperCase() ?? "?";
  return id.slice(-2).toUpperCase();
}

export default function VisitorsClient({
  sitePublicId,
  siteName,
}: {
  sitePublicId: string;
  siteName: string;
}) {
  const [items, setItems] = useState<VisitorProfile[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [intent, setIntent] = useState("all");
  const [source, setSource] = useState("all");

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    const sp = new URLSearchParams({
      page: String(page),
      intent,
      source,
    });
    if (debouncedSearch) sp.set("search", debouncedSearch);
    const r = await fetch(`/api/sites/${sitePublicId}/visitors?${sp}`);
    if (r.ok) {
      const j = (await r.json()) as {
        items: VisitorProfile[];
        totalPages: number;
      };
      setItems(j.items);
      setTotalPages(j.totalPages);
    }
    setLoading(false);
  }, [sitePublicId, page, intent, source, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <SiteSubnav siteId={sitePublicId} siteName={siteName} active="visitors" pageTitle="Visitantes" />

      <div className="dash-filter-bar">
        <Input
          type="search"
          placeholder="Buscar nombre, email, empresa…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void load()}
          leftIcon={<Search className="size-4 opacity-70" strokeWidth={2} />}
          className="min-w-0 flex-1 sm:min-w-[220px]"
        />
        <select
          value={intent}
          onChange={(e) => {
            setIntent(e.target.value);
            setPage(1);
          }}
          className="dash-input w-auto min-w-[170px] py-2.5 text-sm"
        >
          <option value="all">Intent: todos</option>
          <option value="exploring">Explorando</option>
          <option value="interested">Interesado</option>
          <option value="evaluating">Evaluando</option>
          <option value="ready_to_buy">Listo para comprar</option>
          <option value="hot_lead">Hot lead</option>
        </select>
        <select
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            setPage(1);
          }}
          className="dash-input w-auto min-w-[150px] py-2.5 text-sm"
        >
          <option value="all">Fuente: todas</option>
          <option value="google">Google</option>
          <option value="instagram">Instagram</option>
          <option value="direct">Direct</option>
          <option value="referral">Referral</option>
        </select>
        <Button type="button" size="sm" variant="secondary" onClick={() => void load()} className="shrink-0">
          Aplicar
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="dash-skeleton h-16" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="dash-empty">
          <p className="mb-4 text-3xl" aria-hidden>
            👤
          </p>
          <p className="font-syne text-lg font-bold text-[color:var(--c-text)]">Todavía no hay visitantes</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[color:var(--c-muted)]">
            Cuando el widget esté instalado y los usuarios chateen, vas a ver acá perfiles con intent, tiempo en sitio y
            fuente de tráfico.
          </p>
          <Button asChild className="mt-8">
            <Link href={`/dashboard/${sitePublicId}/install`}>Ir a instalación</Link>
          </Button>
        </div>
      ) : (
        <div className="dash-table-wrap overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[color:var(--c-muted2)]">#</th>
                <th className="px-4 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[color:var(--c-muted2)]">Visitante</th>
                <th className="px-4 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[color:var(--c-muted2)]">Intent</th>
                <th className="px-4 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[color:var(--c-muted2)]">Empresa</th>
                <th className="px-4 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[color:var(--c-muted2)]">Sesiones</th>
                <th className="px-4 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[color:var(--c-muted2)]">Tiempo</th>
                <th className="px-4 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[color:var(--c-muted2)]">Fuente</th>
                <th className="px-4 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[color:var(--c-muted2)]">Última visita</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {items.map((v, idx) => (
                <tr key={v.id}>
                  <td className="px-4 py-3 text-[color:var(--c-muted2)]">{(page - 1) * PAGE + idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--c-accent-dim)] text-xs font-bold text-[color:var(--c-text)]">
                        {initials(v.name, v.email, v.visitorId)}
                      </div>
                      <div>
                        <p className="font-medium text-[color:var(--c-text)]">
                          {v.name?.trim() || "Visitante anónimo"}
                        </p>
                        {v.email ? <p className="text-xs text-[color:var(--c-muted)]">{v.email}</p> : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <IntentBadge label={v.maxIntentLabel} />
                  </td>
                  <td className="px-4 py-3 text-[color:var(--c-muted)]">{v.company ?? "—"}</td>
                  <td className="px-4 py-3 text-[color:var(--c-text)]">{v.totalVisits}</td>
                  <td className="px-4 py-3 text-[color:var(--c-muted)]">{formatDurationSec(v.totalTime)}</td>
                  <td className="px-4 py-3 capitalize text-[color:var(--c-muted)]">{v.topSource ?? "—"}</td>
                  <td className="px-4 py-3 text-[color:var(--c-muted2)]">
                    {formatDistanceToNow(v.lastSeenAt, { addSuffix: true, locale: es })}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/dashboard/${sitePublicId}/visitors/${v.visitorId}`}
                      className="font-medium text-[color:var(--c-accent)] hover:underline"
                    >
                      Ver perfil
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-ghost btn-ghost--sm disabled:pointer-events-none disabled:opacity-35"
          >
            Anterior
          </button>
          <span className="flex items-center px-2 text-sm tabular-nums text-[color:var(--c-muted)]">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-ghost btn-ghost--sm disabled:pointer-events-none disabled:opacity-35"
          >
            Siguiente
          </button>
        </div>
      ) : null}
    </div>
  );
}
