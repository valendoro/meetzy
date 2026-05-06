"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
  const [openId, setOpenId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<{ role: string; content: string; createdAt: string }[] | null>(
    null,
  );

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

  const openTranscript = async (id: string) => {
    if (openId === id) {
      setOpenId(null);
      setTranscript(null);
      return;
    }
    setOpenId(id);
    const r = await fetch(`/api/sites/${sitePublicId}/conversations/${id}`);
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
    }
  };

  return (
    <div>
      <SiteSubnav siteId={sitePublicId} siteName={siteName} active="conversations" pageTitle="Conversaciones" />

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
          <p className="text-3xl mb-4" aria-hidden>
            💬
          </p>
          <h3 className="font-syne text-lg font-bold text-[color:var(--c-text)] mb-2">Sin conversaciones aún</h3>
          <p className="text-sm text-[color:var(--c-muted)] max-w-md mx-auto leading-relaxed">
            Cuando el widget esté en tu sitio, cada chat va a aparecer acá con intención, duración y preview.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((c) => (
            <div key={c.id} className="dash-card overflow-hidden p-0 [&::before]:opacity-60">
              <button
                type="button"
                onClick={() => void openTranscript(c.id)}
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
              {openId === c.id && transcript ? (
                <div className="border-t border-[color:var(--c-border)] bg-[color:var(--c-bg-subtle)]/80 p-4">
                  <ConversationTranscript messages={transcript} />
                </div>
              ) : null}
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
