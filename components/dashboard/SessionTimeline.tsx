"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronDown, ChevronUp, MessageSquare, Clock, Globe } from "lucide-react";
import ConversationTranscript from "./ConversationTranscript";
import IntentBadge from "./IntentBadge";
import { formatDurationSec } from "@/lib/format-duration";
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
    return (
      <p className="text-[13px] text-[var(--text-secondary)]">Sin visitas registradas.</p>
    );
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical guide line */}
      {conversations.length > 1 && (
        <div className="absolute left-[11px] top-6 bottom-6 w-px bg-[var(--border-subtle)] pointer-events-none" />
      )}

      {conversations.map((c, idx) => {
        const isOpen = openId === c.id;
        const date = c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt);
        const userMessages = c.messages.filter((m) => m.role === "user").length;

        return (
          <div key={c.id} className="relative pl-7">
            {/* Timeline dot */}
            <div
              className={`absolute left-0 top-4 flex size-[22px] items-center justify-center rounded-full border transition-colors ${
                idx === 0
                  ? "border-[var(--accent-border)] bg-[var(--accent-subtle)]"
                  : "border-[var(--border-default)] bg-[var(--bg-surface)]"
              }`}
            >
              <span
                className={`size-[7px] rounded-full ${idx === 0 ? "bg-[var(--accent)]" : "bg-[var(--text-tertiary)]"}`}
              />
            </div>

            <div
              className={`mb-3 overflow-hidden rounded-[var(--radius-lg)] border transition-all duration-150 ${
                isOpen
                  ? "border-[var(--border-default)] bg-[var(--bg-elevated)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--border-default)]"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : c.id)}
                className="flex w-full items-start gap-3 p-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  {/* Date + badge row */}
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[12px] font-semibold text-[var(--text-primary)]">
                      {format(date, "d MMM yyyy · HH:mm", { locale: es })}
                    </span>
                    <IntentBadge label={c.intentLabel} />
                    {idx === 0 && (
                      <span className="rounded-[4px] border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                        Última
                      </span>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-tertiary)]">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatDurationSec(c.sessionDuration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="size-3" />
                      {userMessages} {userMessages === 1 ? "mensaje" : "mensajes"}
                    </span>
                    {c.device && (
                      <span className="flex items-center gap-1">
                        <Globe className="size-3" />
                        {c.device}
                      </span>
                    )}
                    <span className="tabular-nums font-medium text-[var(--text-secondary)]">
                      {c.intentScore} pts
                    </span>
                  </div>

                  {/* Pages visited */}
                  {c.pagesVisited?.length ? (
                    <p className="mt-1.5 text-[11px] text-[var(--text-tertiary)] truncate">
                      {c.pagesVisited.join(" → ")}
                    </p>
                  ) : null}
                </div>

                <span className="mt-0.5 shrink-0 text-[var(--text-tertiary)]">
                  {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </span>
              </button>

              {isOpen ? (
                <div className="border-t border-[var(--border-subtle)] p-4">
                  {c.messages.length === 0 ? (
                    <p className="text-[13px] text-[var(--text-secondary)]">Sin mensajes en esta sesión.</p>
                  ) : (
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
                  )}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
