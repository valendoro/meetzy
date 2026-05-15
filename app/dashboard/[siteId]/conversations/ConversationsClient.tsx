"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { X, Search, Download } from "lucide-react";
import SiteSubnav from "@/components/dashboard/SiteSubnav";
import IntentBadge from "@/components/dashboard/IntentBadge";
import ConversationTranscript from "@/components/dashboard/ConversationTranscript";
import { formatDurationSec } from "@/lib/format-duration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Row {
  id: string;
  visitorId: string;
  createdAt: string;
  intentScore: number;
  intentLabel: string;
  sessionDuration: number;
  messageCount: number;
  country: string | null;
  device: string | null;
  visitorEmail: string | null;
  visitorName: string | null;
  preview: string;
}

const PAGE = 20;

export default function ConversationsClient({
  sitePublicId,
  siteName,
}: {
  sitePublicId: string;
  siteName: string;
}) {
  const [items, setItems] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [intent, setIntent] = useState("all");
  const [hasEmail, setHasEmail] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<Row | null>(null);
  const [transcript, setTranscript] = useState<{ role: string; content: string; createdAt: string }[] | null>(
    null,
  );
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    const sp = new URLSearchParams({ page: String(page), intent });
    if (hasEmail !== "all") sp.set("hasEmail", hasEmail);
    if (debouncedSearch) sp.set("search", debouncedSearch);

    const r = await fetch(`/api/sites/${sitePublicId}/conversations?${sp}`);
    if (r.ok) {
      const j = (await r.json()) as { items: Row[]; totalPages: number; total: number };
      setItems(j.items);
      setTotalPages(j.totalPages);
      setTotal(j.total);
    }
    setLoading(false);
  }, [sitePublicId, page, intent, hasEmail, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  const openTranscript = async (row: Row) => {
    setActiveRow(row);
    setDialogOpen(true);
    setTranscript(null);
    setTranscriptLoading(true);
    const r = await fetch(`/api/sites/${sitePublicId}/conversations/${row.id}`);
    if (r.ok) {
      const j = (await r.json()) as {
        conversation: { messages: { role: string; content: string; createdAt: string }[] };
      };
      setTranscript(
        j.conversation.messages.map((m) => ({
          role: m.role,
          content: m.content,
          createdAt: typeof m.createdAt === "string" ? m.createdAt : new Date(m.createdAt).toISOString(),
        })),
      );
    } else {
      setTranscript([]);
    }
    setTranscriptLoading(false);
  };

  const onDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setActiveRow(null);
      setTranscript(null);
    }
  };

  return (
    <div>
      <SiteSubnav siteId={sitePublicId} siteName={siteName} active="conversations" pageTitle="Conversaciones" />

      <Dialog.Root open={dialogOpen} onOpenChange={onDialogOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-[rgba(4,4,8,0.80)] backdrop-blur-[8px]" />
          <Dialog.Content
            className="fixed z-[101] flex max-h-[min(90dvh,740px)] w-full max-w-[min(calc(100vw-24px),600px)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-elevated)] shadow-[0_32px_96px_rgba(0,0,0,0.55)] max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:max-h-[min(90dvh,740px)] max-md:rounded-b-none max-md:rounded-t-[var(--radius-xl)] md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-[var(--border-subtle)]">
              <div className="min-w-0 flex-1">
                <Dialog.Title className="font-syne text-[15px] font-extrabold tracking-tight text-[var(--text-primary)]">
                  Conversación
                </Dialog.Title>
                {activeRow ? (
                  <Dialog.Description asChild>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[11px] text-[var(--text-tertiary)]">
                        {format(new Date(activeRow.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                      </span>
                      <span className="text-[var(--text-tertiary)] opacity-30">·</span>
                      <span className="text-[11px] text-[var(--text-tertiary)]">
                        {formatDurationSec(activeRow.sessionDuration)}
                      </span>
                      <span className="text-[var(--text-tertiary)] opacity-30">·</span>
                      <span className="text-[11px] text-[var(--text-tertiary)]">
                        {activeRow.messageCount} mensajes
                      </span>
                      <IntentBadge label={activeRow.intentLabel} />
                    </div>
                  </Dialog.Description>
                ) : (
                  <Dialog.Description className="sr-only">Mensajes de la conversación</Dialog.Description>
                )}
              </div>
              <Dialog.Close
                type="button"
                className="shrink-0 mt-0.5 rounded-[var(--radius-md)] p-1.5 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </Dialog.Close>
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 [scrollbar-color:rgba(99,102,241,0.25)_transparent]">
              {transcriptLoading ? (
                <div className="space-y-4">
                  {[80, 56, 100, 44].map((h, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                      <div className="dash-skeleton rounded-2xl" style={{ height: h, width: "60%" }} />
                    </div>
                  ))}
                </div>
              ) : transcript && transcript.length > 0 ? (
                <ConversationTranscript messages={transcript} />
              ) : (
                <p className="py-8 text-center text-[13px] text-[var(--text-tertiary)]">
                  Sin mensajes registrados.
                </p>
              )}
            </div>

            {/* Footer */}
            {activeRow && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-3">
                <div className="flex flex-wrap gap-2 text-[11px] text-[var(--text-tertiary)]">
                  {activeRow.visitorName && <span className="font-medium text-[var(--text-secondary)]">👤 {activeRow.visitorName}</span>}
                  {activeRow.country && <span>🌍 {activeRow.country}</span>}
                  {activeRow.device && <span>📱 {activeRow.device}</span>}
                  {activeRow.visitorEmail && (
                    <span className="text-emerald-400">✉ {activeRow.visitorEmail}</span>
                  )}
                </div>
                <Link
                  href={`/dashboard/${sitePublicId}/visitors/${activeRow.visitorId}`}
                  className="text-[11px] font-semibold text-[var(--accent)] hover:underline"
                >
                  Ver perfil del visitante →
                </Link>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="dash-filter-bar">
        <Input
          type="search"
          placeholder="Buscar por email o preview…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="size-4 opacity-70" strokeWidth={2} />}
          className="min-w-0 flex-1 sm:min-w-[200px]"
        />
        <select
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          className="dash-input w-auto min-w-[180px] py-2.5 text-sm"
        >
          <option value="all">Intent: todos</option>
          <option value="exploring">Explorando</option>
          <option value="interested">Interesado</option>
          <option value="evaluating">Evaluando</option>
          <option value="ready_to_buy">Listo</option>
          <option value="hot_lead">Hot lead</option>
        </select>
        <select
          value={hasEmail}
          onChange={(e) => setHasEmail(e.target.value)}
          className="dash-input w-auto min-w-[160px] py-2.5 text-sm"
        >
          <option value="all">Email: todos</option>
          <option value="true">Con email</option>
          <option value="false">Sin email</option>
        </select>
        {total !== null && (
          <span className="shrink-0 text-[11px] tabular-nums text-[var(--text-tertiary)] whitespace-nowrap">
            {total} resultado{total !== 1 ? "s" : ""}
          </span>
        )}
        <a
          href={`/api/sites/${sitePublicId}/emails?format=csv`}
          download
          className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-overlay)] px-3 py-2 text-[12px] font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--accent-border)] hover:text-[var(--accent)]"
          title="Exportar emails capturados a CSV"
        >
          <Download className="size-3.5" />
          <span className="hidden sm:inline">Exportar emails</span>
        </a>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="dash-skeleton h-28" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="dash-empty dash-empty--page">
          <p className="mb-4 text-3xl" aria-hidden>
            💬
          </p>
          <h3 className="mb-2 font-syne text-lg font-bold text-[var(--text-primary)]">Sin conversaciones aún</h3>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
            Cuando el widget esté en tu sitio, cada chat va a aparecer acá con intención, duración y preview.
          </p>
          <Button asChild className="mt-8 min-h-11 px-5">
            <Link href={`/dashboard/${sitePublicId}/install`}>Instalar widget</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((c) => (
            <div
              key={c.id}
              className="group overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] transition-all duration-150 hover:border-[var(--border-default)] hover:bg-[var(--bg-overlay)]"
            >
              <button
                type="button"
                onClick={() => void openTranscript(c)}
                className="flex w-full items-start gap-4 p-4 text-left sm:items-center"
              >
                {/* Left: intent dot */}
                <div className="mt-1 shrink-0 sm:mt-0">
                  <IntentBadge label={c.intentLabel} />
                </div>

                {/* Center: preview + meta */}
                <div className="min-w-0 flex-1">
                  {(c.visitorName || c.visitorEmail) && (
                    <p className="mb-0.5 truncate text-[11px] font-semibold text-[var(--text-secondary)]">
                      {c.visitorName ?? c.visitorEmail}
                    </p>
                  )}
                  <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">
                    {c.preview || <span className="text-[var(--text-tertiary)] italic">Sin preview</span>}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[var(--text-tertiary)]">
                    <span>{format(new Date(c.createdAt), "d MMM, HH:mm", { locale: es })}</span>
                    <span className="opacity-40">·</span>
                    <span>{formatDurationSec(c.sessionDuration)}</span>
                    <span className="opacity-40">·</span>
                    <span>{c.messageCount} mensajes</span>
                    {c.country && <><span className="opacity-40">·</span><span>{c.country}</span></>}
                    {c.visitorEmail && !c.visitorName && (
                      <span className="text-emerald-400">✉ {c.visitorEmail}</span>
                    )}
                    {c.visitorEmail && c.visitorName && (
                      <span className="text-emerald-400">✉</span>
                    )}
                  </div>
                </div>

                {/* Right: score + link */}
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-[11px] tabular-nums text-[var(--text-tertiary)] sm:block">
                    {c.intentScore} pts
                  </span>
                  <Link
                    href={`/dashboard/${sitePublicId}/visitors/${c.visitorId}`}
                    className="hidden text-[11px] font-medium text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100 hover:underline sm:block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Perfil →
                  </Link>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-ghost btn-ghost--sm disabled:pointer-events-none disabled:opacity-35"
          >
            Anterior
          </button>
          <span className="px-3 py-2 text-sm tabular-nums text-[var(--text-secondary)]">
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
