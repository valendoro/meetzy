"use client";

import Link from "next/link";
import { Search, Download } from "lucide-react";
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
          <option value="facebook">Facebook</option>
        </select>
        <Button type="button" size="sm" variant="secondary" onClick={() => void load()} className="shrink-0">
          Aplicar
        </Button>
        <a
          href={`/api/sites/${sitePublicId}/emails?format=csv`}
          download
          className="btn-ghost btn-ghost--sm flex items-center gap-1.5 shrink-0"
          title="Descargar emails con intent como CSV"
        >
          <Download className="size-3.5" />
          CSV
        </a>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="dash-skeleton h-16" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="dash-empty dash-empty--page">
          <p className="mb-4 text-3xl" aria-hidden>
            👤
          </p>
          <p className="font-syne text-lg font-bold text-[var(--text-primary)]">Todavía no hay visitantes</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
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
                <th className="px-6 py-5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">#</th>
                <th className="px-6 py-5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Visitante</th>
                <th className="px-6 py-5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Intent</th>
                <th className="px-6 py-5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Empresa</th>
                <th className="px-6 py-5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Sesiones</th>
                <th className="px-6 py-5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Tiempo</th>
                <th className="px-6 py-5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Fuente</th>
                <th className="px-6 py-5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Última visita</th>
                <th className="px-6 py-5" />
              </tr>
            </thead>
            <tbody>
              {items.map((v, idx) => (
                <tr key={v.id}>
                  <td className="px-6 py-5 text-[var(--text-tertiary)]">{(page - 1) * PAGE + idx + 1}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-xs font-bold text-[var(--text-primary)]">
                        {initials(v.name, v.email, v.visitorId)}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {v.name?.trim() || "Visitante anónimo"}
                        </p>
                        {v.email ? <p className="text-xs text-[var(--text-secondary)]">{v.email}</p> : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <IntentBadge label={v.maxIntentLabel} />
                  </td>
                  <td className="px-6 py-5 text-[var(--text-secondary)]">{v.company ?? "—"}</td>
                  <td className="px-6 py-5 text-[var(--text-primary)]">{v.totalVisits}</td>
                  <td className="px-6 py-5 text-[var(--text-secondary)]">{formatDurationSec(v.totalTime)}</td>
                  <td className="px-6 py-5 capitalize text-[var(--text-secondary)]">{v.topSource ?? "—"}</td>
                  <td className="px-6 py-5 text-[var(--text-tertiary)]">
                    {formatDistanceToNow(v.lastSeenAt, { addSuffix: true, locale: es })}
                  </td>
                  <td className="px-6 py-5.5 text-right">
                    <Link
                      href={`/dashboard/${sitePublicId}/visitors/${v.visitorId}`}
                      className="inline-flex min-h-10 items-center font-medium text-[var(--accent)] hover:underline"
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
          <span className="flex items-center px-2 text-sm tabular-nums text-[var(--text-secondary)]">
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
