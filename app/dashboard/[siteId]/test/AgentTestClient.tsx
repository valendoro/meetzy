"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Send, RotateCcw, Bot, Lightbulb, Zap } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  siteId: string;
  agentName: string;
  agentType: string;
  welcomeMessage: string;
  brandColor: string;
}

const TEST_VISITOR_ID = "dashboard-test-preview";

const SUGGESTIONS_BY_TYPE: Record<string, string[]> = {
  vendedor: [
    "¿Cuánto sale el plan Pro?",
    "¿Qué incluye el precio?",
    "¿Tienen prueba gratis?",
    "Quiero una demo",
    "¿Cómo me contacto con ventas?",
  ],
  guia: [
    "¿Cómo funciona esto?",
    "¿Para quién es ideal?",
    "¿Cuáles son las características principales?",
    "¿Hay documentación disponible?",
    "¿Qué hace exactamente este producto?",
  ],
  soporte: [
    "Tengo un problema con mi cuenta",
    "¿Cómo lo resuelvo?",
    "El sistema no me deja ingresar",
    "Necesito hablar con alguien",
    "¿Cuánto demoran en responder?",
  ],
  recepcionista: [
    "Quiero reservar un turno",
    "¿Cuál es la disponibilidad?",
    "¿Cómo cancelo mi reserva?",
    "¿Qué necesito llevar?",
    "¿Aceptan pagos online?",
  ],
};

const FALLBACK_SUGGESTIONS = [
  "¿Qué hacen ustedes?",
  "¿Cuánto cuesta?",
  "¿Cómo me registro?",
  "Quiero hablar con alguien",
  "¿Tienen soporte en español?",
];

export default function AgentTestClient({ siteId, agentName, agentType, welcomeMessage, brandColor }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [streaming, setStreaming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = SUGGESTIONS_BY_TYPE[agentType] ?? FALLBACK_SUGGESTIONS;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          message: text,
          conversationId,
          visitorId: TEST_VISITOR_ID,
          plan: "elite",
        }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Error al conectar con el agente." },
        ]);
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      let newConvId = conversationId;

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data) as {
                text?: string;
                conversationId?: string;
                done?: boolean;
              };
              if (parsed.conversationId && !newConvId) {
                newConvId = parsed.conversationId;
                setConversationId(newConvId);
              }
              if (parsed.text) {
                assistantText += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: assistantText };
                  return updated;
                });
              }
            } catch {
              // skip non-JSON lines
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error de red. Intentá de nuevo." },
      ]);
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }

  function reset() {
    startTransition(() => {
      setMessages([{ role: "assistant", content: welcomeMessage }]);
      setConversationId(undefined);
      setInput("");
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  const msgCount = messages.filter(m => m.role === "user").length;

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Chat panel */}
      <div className="flex-1 flex flex-col rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden min-h-[540px] max-h-[720px]">
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-subtle)]"
          style={{ background: `color-mix(in srgb, ${brandColor} 8%, transparent)` }}
        >
          <div
            className="flex size-8 items-center justify-center rounded-full"
            style={{ background: brandColor }}
          >
            <Bot className="size-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-syne text-[13px] font-bold text-[var(--text-primary)]">{agentName}</p>
            <div className="flex items-center gap-1.5">
              <span className="inline-block size-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.6)" }} />
              <p className="text-[11px] text-[var(--text-tertiary)]">Modo prueba · no afecta analytics</p>
            </div>
          </div>
          {msgCount > 0 && (
            <span className="text-[11px] tabular-nums text-[var(--text-tertiary)]">{msgCount} msg</span>
          )}
          <button
            type="button"
            onClick={reset}
            disabled={isPending}
            className="rounded p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            title="Reiniciar conversación"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div
                  className="flex size-6 shrink-0 items-center justify-center rounded-full mt-1"
                  style={{ background: brandColor }}
                >
                  <Bot className="size-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-br-[4px] text-white"
                    : "rounded-bl-[4px] border border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-[var(--text-primary)]"
                }`}
                style={msg.role === "user" ? { background: brandColor } : undefined}
              >
                {msg.content || (
                  <span className="flex gap-1 items-center text-[var(--text-tertiary)]">
                    <span className="inline-block size-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                    <span className="inline-block size-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                    <span className="inline-block size-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[var(--border-subtle)] p-3 flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={streaming}
            rows={1}
            placeholder="Escribí para probar el agente… (Enter para enviar)"
            className="flex-1 resize-none rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors max-h-[100px] overflow-y-auto"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={streaming || !input.trim()}
            className="shrink-0 flex size-9 items-center justify-center rounded-[var(--radius-md)] transition-all disabled:opacity-40"
            style={{ background: brandColor }}
          >
            <Send className="size-4 text-white" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:w-64 space-y-4">
        {/* Suggestions */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Lightbulb className="size-3.5 text-[var(--accent)]" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
              Probá preguntando
            </p>
          </div>
          <ul className="space-y-1.5">
            {suggestions.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  className="text-left w-full rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--accent)] transition-colors"
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick actions */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Zap className="size-3.5 text-amber-400" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
              Acciones rápidas
            </p>
          </div>
          <ul className="space-y-1.5">
            {[
              "Quiero hablar con alguien",
              "Tengo una queja",
              "Necesito ayuda urgente",
            ].map((q) => (
              <li key={q}>
                <button
                  type="button"
                  className="text-left w-full rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-amber-400 transition-colors"
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
            Modo prueba
          </p>
          <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
            Las conversaciones de prueba{" "}
            <strong className="text-[var(--text-primary)]">no se guardan en analytics</strong>{" "}
            y no afectan producción. Ideal para validar cambios en configuración o base de conocimiento.
          </p>
        </div>
      </div>
    </div>
  );
}
