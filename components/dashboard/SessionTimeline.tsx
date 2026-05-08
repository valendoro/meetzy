"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ConversationTranscript from "./ConversationTranscript";
import type { Message as DbMessage } from "@prisma/client";

export interface ConversationSessionRow {
  id: string;
  createdAt: Date | string;
  sessionDuration: number;
  intentScore: number;
  intentLabel: string;
  pagesVisited: string[];
  visitorEmail?: string | null;
  device?: string | null;
  messages: Pick<DbMessage, "role" | "content" | "createdAt">[];
}

export default function SessionTimeline({ conversations }: { conversations: ConversationSessionRow[] }) {
  const [openId, setOpenId] = useState<string | null>(conversations[0]?.id ?? null);

  if (!conversations.length) {
    return <p className="text-sm text-[var(--text-secondary)]">Sin visitas registradas.</p>;
  }

  return (
    <div className="space-y-3">
      {conversations.map((c) => {
        const isOpen = openId === c.id;
        return (
          <div
            key={c.id}
            className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)]"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : c.id)}
              className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-[var(--bg-overlay)]"
            >
              <div>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {format(
                    c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt),
                    "d MMM yyyy · HH:mm",
                    { locale: es },
                  )}
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {formatDuration(c.sessionDuration)} · {c.messages.length} mensajes · intent {c.intentScore} (
                  {c.intentLabel.replace(/_/g, " ")})
                </p>
                {c.pagesVisited?.length ? (
                  <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                    Páginas: {c.pagesVisited.join(" → ")}
                  </p>
                ) : null}
              </div>
              <span className="text-[var(--text-secondary)]">{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen ? (
              <div className="border-t border-[var(--border-subtle)] p-4">
                <ConversationTranscript
                  messages={c.messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                    createdAt:
                      m.createdAt instanceof Date
                        ? m.createdAt.toISOString()
                        : String(m.createdAt),
                  }))}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function formatDuration(sec: number): string {
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}s`;
  return `${m}m ${r}s`;
}
