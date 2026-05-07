"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import SiteSubnav from "@/components/dashboard/SiteSubnav";
import IntentBadge from "@/components/dashboard/IntentBadge";
import ConversationTranscript from "@/components/dashboard/ConversationTranscript";
import { formatDurationSec } from "@/lib/format-duration";

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
  const [loading, setLoading] = useState(true);
  const [intent, setIntent] = useState("all");
  const [hasEmail, setHasEmail] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<Row | null>(null);
  const [transcript, setTranscript] = useState<{ role: string; content: string; createdAt: string }[] | null>(
    null,
  );
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const sp = new URLSearchParams({ page: String(page), intent });
    if (hasEmail !== "all") sp.set("hasEmail", hasEmail);
    const r = await fetch(`/api/sites/${sitePublicId}/conversations?${sp}`);
    if (r.ok) {
      const j = (await r.json()) as { items: Row[]; totalPages: number };
      setItems(j.items);
      setTotalPages(j.totalPages);
    }
    setLoading(false);
  }, [sitePublicId, page, intent, hasEmail]);

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
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-[rgba(6,6,8,0.85)] backdrop-blur-[12px]" />
          <Dialog.Content
            className="dash-modal-panel fixed z-[101] flex max-h-[min(88dvh,720px)] w-full max-w-[min(calc(100vw-24px),640px)] flex-col border border-[color:var(--c-border2)] bg-[color:var(--c-surface2)] shadow-[0_24px_80px_rgba(0,0,0,0.45)] max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:max-h-[min(88dvh,720px)] max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-b-none max-md:rounded-t-[var(--radius-xl)] md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[var(--radius-lg)]"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[color:var(--c-border2)] px-5 py-4">
              <div className="min-w-0">
                <Dialog.Title className="font-syne text-base font-bold text-[color:var(--c-text)]">
                  Transcripción
                </Dialog.Title>
                {activeRow ? (
                  <Dialog.Description className="mt-1 text-xs text-[color:var(--c-muted)]">
                    {format(new Date(activeRow.createdAt), "d MMM yyyy, HH:mm", { locale: es })} ·{" "}
                    {formatDurationSec(activeRow.sessionDuration)} · {activeRow.messageCount} mensajes
                  </Dialog.Description>
                ) : (
                  <Dialog.Description className="sr-only">Mensajes de la conversación seleccionada</Dialog.Description>
                )}
              </div>
              <Dialog.Close
                type="button"
                className="rounded-[var(--radius-md)] p-2 text-[color:var(--c-muted)] transition-colors hover:bg-[color:var(--c-surface2)] hover:text-[color:var(--c-text)]"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </Dialog.Close>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5 [scrollbar-color:rgba(124,108,255,0.35)_transparent]">
              {transcriptLoading ? (
                <div className="space-y-3">
                  <div className="dash-skeleton h-20" />
                  <div className="dash-skeleton h-20" />
                  <div className="dash-skeleton h-20" />
                </div>
              ) : transcript && transcript.length > 0 ? (
                <ConversationTranscript messages={transcript} />
              ) : transcript && transcript.length === 0 ? (
                <p className="text-sm text-[color:var(--c-muted)]">No hay mensajes en esta conversación.</p>
              ) : null}
            </div>
            {activeRow ? (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[color:var(--c-border2)] px-5 py-3">
                <Link
                  href={`/dashboard/${sitePublicId}/visitors/${activeRow.visitorId}`}
                  className="text-xs font-semibold text-[color:var(--c-accent)] hover:underline"
                >
                  Ver perfil del visitante
                </Link>
              </div>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="dash-filter-bar">
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
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="dash-skeleton h-28" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="dash-empty">
          <p className="mb-4 text-3xl" aria-hidden>
            💬
          </p>
          <h3 className="mb-2 font-syne text-lg font-bold text-[color:var(--c-text)]">Sin conversaciones aún</h3>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-[color:var(--c-muted)]">
            Cuando el widget esté en tu sitio, cada chat va a aparecer acá con intención, duración y preview.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((c) => (
            <div key={c.id} className="dash-card dash-card--quiet overflow-hidden p-0 [&::before]:opacity-60">
              <button
                type="button"
                onClick={() => void openTranscript(c)}
                className="flex w-full flex-col gap-2 p-4 text-left transition-colors hover:bg-[color:var(--c-surface2)]/35 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[color:var(--c-muted)]">
                    {format(new Date(c.createdAt), "d MMM yyyy, HH:mm", { locale: es })} ·{" "}
                    {formatDurationSec(c.sessionDuration)} · {c.messageCount} msgs
                    {c.country ? ` · ${c.country}` : ""}
                    {c.device ? ` · ${c.device}` : ""}
                  </p>
                  <p className="mt-1 truncate text-sm text-[color:var(--c-text)]">{c.preview || "—"}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {c.visitorEmail ? (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                      Email
                    </span>
                  ) : null}
                  <IntentBadge label={c.intentLabel} />
                  <span className="text-xs text-[color:var(--c-muted)]">{c.intentScore} pts</span>
                  <Link
                    href={`/dashboard/${sitePublicId}/visitors/${c.visitorId}`}
                    className="text-xs text-[color:var(--c-accent)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Perfil
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
          <span className="px-3 py-2 text-sm tabular-nums text-[color:var(--c-muted)]">
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
