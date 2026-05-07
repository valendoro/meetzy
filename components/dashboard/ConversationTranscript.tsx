"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ConversationTranscript({
  messages,
}: {
  messages: { role: string; content: string; createdAt: string }[];
}) {
  return (
    <div className="space-y-3">
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[min(92%,480px)] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === "user"
                ? "rounded-tr-sm bg-[var(--accent)] text-white ring-1 ring-[rgba(255,255,255,0.12)]"
                : "rounded-tl-sm border border-[color:var(--c-border)] bg-[color:var(--c-surface2)] text-[color:var(--c-text)]"
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
            <p
              className={`mt-1 text-[10px] ${
                m.role === "user" ? "text-white/70" : "text-[color:var(--c-muted2)]"
              }`}
            >
              {format(new Date(m.createdAt), "HH:mm:ss", { locale: es })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
