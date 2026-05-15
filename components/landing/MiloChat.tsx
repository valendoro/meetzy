"use client";

import { useEffect, useRef, useState } from "react";
import { MiloAvatarSmall } from "./MiloAvatar";
import { buildContextPrompt, type VisitorContext } from "@/lib/behavior-tracker";
import DemoPanel from "./DemoPanel";

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
  onAction?: (action: string) => void;
}

const SITE_ID = "meetzy-landing";

// Quick replies shown after first Milo message
const QUICK_REPLIES = [
  { label: "¿Cómo funciona?", msg: "¿Cómo funciona Meetzy exactamente?" },
  { label: "Ver mis datos 🔍", msg: "Mostrame los datos que tenés de mí ahora mismo" },
  { label: "¿Cuánto cuesta?", msg: "¿Cuánto cuesta? ¿Hay versión gratis?" },
  { label: "Demo real", msg: "Quiero ver un demo real de cómo funciona en una web" },
];

// Parse [ACTION:xxx] commands from agent text
function parseActions(text: string): { clean: string; actions: string[] } {
  const actions: string[] = [];
  const clean = text.replace(/\[ACTION:[^\]]+\]/g, (match) => {
    const action = match.slice(8, -1);
    actions.push(action);
    return "";
  }).trim();
  return { clean, actions };
}

// Dispatch a page-level event for MiloDemo to handle
function dispatchPageAction(action: string) {
  window.dispatchEvent(new CustomEvent("meetzy:action", { detail: { action } }));
}

export default function MiloChat({
  initialMessage,
  context,
  onSpeakingChange,
  onClose,
  onAction,
}: MiloChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [usedQuickReplies, setUsedQuickReplies] = useState(false);
  const [demoVisible, setDemoVisible] = useState(false);
  const [visitorId] = useState(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("mz_uid") ?? (() => {
          const id = Math.random().toString(36).slice(2);
          localStorage.setItem("mz_uid", id);
          return id;
        })())
      : "landing-visitor"
  );
  const msgsRef = useRef<HTMLDivElement>(null);
  const conversationId = useRef<string | undefined>(undefined);
  const initialShown = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show initial message with typewriter
  useEffect(() => {
    if (!initialMessage || initialShown.current) return;
    initialShown.current = true;

    setMessages([{ role: "agent", text: "", streaming: true }]);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setMessages([{ role: "agent", text: initialMessage.slice(0, i) }]);
      if (i >= initialMessage.length) {
        clearInterval(iv);
        setTimeout(() => setShowQuickReplies(true), 400);
      }
    }, 18);
    return () => clearInterval(iv);
  }, [initialMessage]);

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [messages, showQuickReplies]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || streaming) return;
    setInput("");
    setShowQuickReplies(false);

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
        setMessages((prev) => [...prev, { role: "agent", text: "Hubo un error. Intentá de nuevo." }]);
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
              const { clean } = parseActions(full);
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "agent", text: clean, streaming: true };
                return copy;
              });
            }
          } catch { /* skip */ }
        }
      }

      // Final: parse and fire actions
      const { clean, actions } = parseActions(full);
      setMessages((prev) => {
        const copy = [...prev];
        if (copy.length > 0) copy[copy.length - 1] = { role: "agent", text: clean };
        return copy;
      });

      // Execute page actions
      for (const action of actions) {
        handleAction(action);
      }

      // Show quick replies again if conversation is short
      if (messages.length < 4 && !usedQuickReplies) {
        setTimeout(() => setShowQuickReplies(true), 600);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "agent", text: "Error de conexión." }]);
    } finally {
      setStreaming(false);
      onSpeakingChange?.(false);
    }
  }

  function handleAction(action: string) {
    onAction?.(action);
    dispatchPageAction(action);

    if (action === "show-demo") {
      setTimeout(() => setDemoVisible(true), 300);
    } else if (action.startsWith("scroll-")) {
      const section = action.replace("scroll-", "");
      const el = document.querySelector(`[data-section="${section}"], #${section}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Highlight effect
        el.classList.add("section-spotlight");
        setTimeout(() => el.classList.remove("section-spotlight"), 2500);
      }
    }
  }

  function handleQuickReply(msg: string) {
    setUsedQuickReplies(true);
    void send(msg);
  }

  return (
    <>
      <DemoPanel context={context} visible={demoVisible} onClose={() => setDemoVisible(false)} />

      <div className="flex flex-col h-full bg-[#0a0a10] border border-[rgba(124,108,255,0.15)] rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(124,108,255,0.04)" }}
        >
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1a1a20] flex-shrink-0 ring-1 ring-[rgba(124,108,255,0.3)]">
            <MiloAvatarSmall size={36} isSpeaking={streaming} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-syne font-bold text-white">Milo</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-[rgba(238,234,228,0.35)]">
                {streaming ? "escribiendo…" : "agente de Meetzy · observando esta página"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDemoVisible(true)}
              title="Ver mis datos"
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all hover:scale-105"
              style={{
                background: "rgba(124,108,255,0.15)",
                border: "1px solid rgba(124,108,255,0.3)",
                color: "rgba(167,139,250,0.9)",
              }}
            >
              🔍 Mis datos
            </button>
            {onClose && (
              <button onClick={onClose} className="text-[rgba(238,234,228,0.3)] hover:text-white transition-colors p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
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
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#7c6cff]"
                      style={{ animation: `bounce-dot 1.2s ease ${d}ms infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[84%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                m.role === "user"
                  ? "text-white rounded-tr-sm"
                  : "bg-[#16161c] border border-[rgba(255,255,255,0.06)] text-[#eeeae4] rounded-tl-sm"
              }`} style={m.role === "user" ? { background: "linear-gradient(135deg, #7c6cff, #6057cc)" } : {}}>
                {m.text || (m.streaming ? (
                  <div className="flex gap-1.5 py-0.5">
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#7c6cff]/50"
                        style={{ animation: `bounce-dot 1.2s ease ${d}ms infinite` }} />
                    ))}
                  </div>
                ) : "")}
                {m.streaming && m.text && (
                  <span className="inline-block w-0.5 h-3.5 bg-[#7c6cff]/70 ml-0.5 align-middle animate-pulse" />
                )}
              </div>
            </div>
          ))}

          {/* Quick replies */}
          {showQuickReplies && !streaming && (
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_REPLIES.map((qr) => (
                <button
                  key={qr.label}
                  onClick={() => handleQuickReply(qr.msg)}
                  className="rounded-full px-3 py-1.5 text-[11px] font-medium transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "rgba(124,108,255,0.12)",
                    border: "1px solid rgba(124,108,255,0.25)",
                    color: "rgba(200,194,255,0.9)",
                  }}
                >
                  {qr.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div
          className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void send()}
            placeholder="Preguntale algo a Milo…"
            disabled={streaming}
            className="flex-1 bg-transparent text-[13px] text-[#eeeae4] placeholder:text-[rgba(238,234,228,0.2)] outline-none disabled:opacity-40"
          />
          <button
            onClick={() => void send()}
            disabled={streaming || !input.trim()}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-all hover:scale-110 active:scale-95"
            style={{ background: "linear-gradient(135deg, #7c6cff, #6057cc)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <style>{`
          @keyframes bounce-dot {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
            40% { transform: translateY(-5px); opacity: 1; }
          }
          .section-spotlight {
            outline: 2px solid rgba(124,108,255,0.6) !important;
            outline-offset: 8px;
            border-radius: 12px;
            transition: outline 0.3s ease;
            box-shadow: 0 0 40px rgba(124,108,255,0.15);
          }
        `}</style>
      </div>
    </>
  );
}
