"use client";

import { useEffect, useRef, useState } from "react";
import { MiloAvatarSmall } from "./MiloAvatar";
import { buildContextPrompt, type VisitorContext } from "@/lib/behavior-tracker";

interface Message {
  role: "agent" | "user";
  text: string;
  streaming?: boolean;
}

interface MiloChatProps {
  initialMessage?: string | null;
  context: VisitorContext;
  onSpeakingChange?: (speaking: boolean) => void;
  onClose?: () => void;
}

const SITE_ID = "meetzy-landing";

export default function MiloChat({
  initialMessage,
  context,
  onSpeakingChange,
  onClose,
}: MiloChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [visitorId] = useState(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("mz_uid") ?? Math.random().toString(36).slice(2))
      : "landing-visitor"
  );
  const msgsRef = useRef<HTMLDivElement>(null);
  const conversationId = useRef<string | undefined>(undefined);
  const initialShown = useRef(false);

  // Show initial message with typewriter
  useEffect(() => {
    if (!initialMessage || initialShown.current) return;
    initialShown.current = true;

    setMessages([{ role: "agent", text: "", streaming: true }]);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setMessages([{ role: "agent", text: initialMessage.slice(0, i) }]);
      if (i >= initialMessage.length) clearInterval(iv);
    }, 22);
  }, [initialMessage]);

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [messages]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || streaming) return;
    setInput("");

    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setStreaming(true);
    onSpeakingChange?.(true);

    const contextPrompt = buildContextPrompt(context);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: SITE_ID,
          message: msg,
          conversationId: conversationId.current,
          visitorId,
          visitorContextPrompt: contextPrompt,
        }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => [
          ...prev,
          { role: "agent", text: "Hubo un error. Intentá de nuevo." },
        ]);
        return;
      }

      const newConvId = res.headers.get("X-Conversation-Id");
      if (newConvId) conversationId.current = newConvId;

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = "";

      setMessages((prev) => [...prev, { role: "agent", text: "", streaming: true }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const chunk = JSON.parse(line.slice(6)) as { type: string; content?: string };
            if (chunk.type === "text" && chunk.content) {
              full += chunk.content;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "agent", text: full };
                return copy;
              });
            }
          } catch { /* skip */ }
        }
      }

      setMessages((prev) => {
        const copy = [...prev];
        if (copy.length > 0) copy[copy.length - 1] = { role: "agent", text: full };
        return copy;
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "agent", text: "Error de conexión." },
      ]);
    } finally {
      setStreaming(false);
      onSpeakingChange?.(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0e0e12] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(255,255,255,0.06)] flex-shrink-0">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1a1a20] flex-shrink-0">
          <MiloAvatarSmall size={36} isSpeaking={streaming} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-syne font-bold text-[#eeeae4]">Milo</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-[rgba(238,234,228,0.38)]">
              {streaming ? "escribiendo..." : "agente de Meetzy · en línea"}
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[rgba(238,234,228,0.3)] hover:text-[#eeeae4] transition-colors p-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={msgsRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ scrollbarWidth: "none" }}
      >
        {messages.length === 0 && (
          <div className="flex justify-start">
            <div className="bg-[#16161c] border border-[rgba(255,255,255,0.06)] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-accent"
                    style={{ animation: `bounce-dot 1.2s ease ${d}ms infinite` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[84%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-accent text-white rounded-tr-sm"
                  : "bg-[#16161c] border border-[rgba(255,255,255,0.06)] text-[#eeeae4] rounded-tl-sm"
              }`}
            >
              {m.text}
              {streaming && i === messages.length - 1 && m.role === "agent" && (
                <span className="inline-block w-0.5 h-3.5 bg-accent/70 ml-0.5 align-middle animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-[rgba(255,255,255,0.06)] px-4 py-3 flex items-center gap-2 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Preguntale algo a Milo…"
          disabled={streaming}
          className="flex-1 bg-transparent text-sm text-[#eeeae4] placeholder:text-[rgba(238,234,228,0.2)] outline-none disabled:opacity-40"
        />
        <button
          onClick={() => send()}
          disabled={streaming || !input.trim()}
          className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 disabled:opacity-30 hover:bg-[#4f46e5] transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
