"use client";

import { format, differenceInMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { Bot, User } from "lucide-react";

interface Msg {
  role: string;
  content: string;
  createdAt: string;
}

function showTimestamp(msgs: Msg[], i: number): boolean {
  if (i === 0) return true;
  const prev = new Date(msgs[i - 1].createdAt);
  const curr = new Date(msgs[i].createdAt);
  return differenceInMinutes(curr, prev) >= 2;
}

export default function ConversationTranscript({ messages }: { messages: Msg[] }) {
  if (!messages.length) {
    return (
      <p className="py-8 text-center text-[13px] text-[var(--text-tertiary)]">
        Sin mensajes en esta conversación.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1 pb-2">
      {messages.map((m, i) => {
        const isUser = m.role === "user";
        const showTime = showTimestamp(messages, i);

        return (
          <div key={i}>
            {showTime && (
              <p className="my-3 text-center text-[10px] font-medium tracking-wide text-[var(--text-tertiary)] opacity-60">
                {format(new Date(m.createdAt), "HH:mm", { locale: es })}
              </p>
            )}

            <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div
                className={`mb-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
                  isUser
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--bg-overlay)] text-[var(--text-tertiary)]"
                }`}
              >
                {isUser ? (
                  <User className="size-3.5" strokeWidth={2} />
                ) : (
                  <Bot className="size-3.5" strokeWidth={2} />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`group relative max-w-[min(78%,440px)] ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    isUser
                      ? "rounded-br-[4px] bg-[var(--accent)] text-white"
                      : "rounded-bl-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
