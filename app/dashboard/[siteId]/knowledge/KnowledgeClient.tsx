"use client";

import { useState, useTransition } from "react";
import { Trash2, Plus, Globe, FileText, HelpCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  type: string;
  sourceUrl: string | null;
  createdAt: string | Date;
}

interface Props {
  siteId: string;
  initialEntries: KnowledgeEntry[];
  plan: string;
  limit: number;
}

const TYPE_CONFIG = {
  text: { icon: FileText, label: "Texto", color: "text-[var(--accent)]" },
  url: { icon: Globe, label: "URL", color: "text-[#34d399]" },
  faq: { icon: HelpCircle, label: "FAQ", color: "text-[#f97316]" },
} as const;

type EntryType = keyof typeof TYPE_CONFIG;

export default function KnowledgeClient({ siteId, initialEntries, plan, limit }: Props) {
  const [entries, setEntries] = useState<KnowledgeEntry[]>(initialEntries);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<EntryType>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const atLimit = entries.length >= limit;

  async function handleAdd() {
    setError("");
    startTransition(async () => {
      const body: Record<string, string> = { type };
      if (type === "url") {
        body.sourceUrl = url;
        body.title = title;
      } else {
        body.title = title;
        body.content = content;
      }

      const res = await fetch(`/api/sites/${siteId}/knowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { entry?: KnowledgeEntry; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Error al guardar.");
        return;
      }
      setEntries((prev) => [data.entry!, ...prev]);
      setTitle("");
      setContent("");
      setUrl("");
      setShowForm(false);
    });
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/sites/${siteId}/knowledge/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeletingId(null);
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Lo que el agente sabe sobre tu negocio —{" "}
            <span className={atLimit ? "text-[#f87171]" : "text-[var(--text-tertiary)]"}>
              {entries.length}/{limit} entradas
            </span>
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          disabled={atLimit}
          className="gap-2"
        >
          <Plus className="size-4" />
          {atLimit ? `Límite ${plan} alcanzado` : "Agregar conocimiento"}
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--accent-border)] bg-[var(--accent-subtle)] p-5 space-y-4">
          {/* Type selector */}
          <div className="flex gap-2 flex-wrap">
            {(["text", "url", "faq"] as EntryType[]).map((t) => {
              const cfg = TYPE_CONFIG[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-3 py-1.5 text-[12px] font-medium transition-all ${
                    type === t
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : "border-[var(--border-default)] bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:border-[var(--accent-border)]"
                  }`}
                >
                  <cfg.icon className="size-3.5" />
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {type === "url" ? (
            <>
              <div className="space-y-1">
                <label className="dash-label">URL a importar</label>
                <input
                  type="url"
                  className="dash-input"
                  placeholder="https://tuempresa.com/precios"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="dash-label">Título (opcional)</label>
                <input
                  type="text"
                  className="dash-input"
                  placeholder="Se detecta automáticamente"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <label className="dash-label">
                  {type === "faq" ? "Pregunta" : "Título"}
                </label>
                <input
                  type="text"
                  className="dash-input"
                  placeholder={type === "faq" ? "¿Cuáles son los horarios de atención?" : "Planes y precios"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="dash-label">
                  {type === "faq" ? "Respuesta" : "Contenido"}
                </label>
                <textarea
                  className="dash-input min-h-[120px] resize-y"
                  placeholder={
                    type === "faq"
                      ? "Atendemos de lunes a viernes de 9 a 18hs."
                      : "Describí este aspecto de tu negocio con detalle..."
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <p className="text-[11px] text-[var(--text-tertiary)]">{content.length}/12000 caracteres</p>
              </div>
            </>
          )}

          {error && <p className="text-[12px] text-[#f87171]">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={() => void handleAdd()} disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {type === "url" ? "Importar URL" : "Guardar"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setShowForm(false); setError(""); }}
              disabled={isPending}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Entries list */}
      {entries.length === 0 ? (
        <div className="dash-empty">
          <div className="mb-4 text-4xl">📚</div>
          <h3 className="font-syne text-[16px] font-bold text-[var(--text-primary)]">
            Sin conocimiento cargado
          </h3>
          <p className="mt-2 max-w-sm text-[13px] text-[var(--text-secondary)]">
            Agregá información sobre tu negocio, precios, FAQs o cualquier URL relevante. El agente
            la usará para dar respuestas precisas.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const cfg = TYPE_CONFIG[entry.type as EntryType] ?? TYPE_CONFIG.text;
            const isExpanded = expanded === entry.id;
            return (
              <div
                key={entry.id}
                className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <cfg.icon className={`size-4 shrink-0 ${cfg.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">
                      {entry.title}
                    </p>
                    {entry.sourceUrl && (
                      <p className="truncate text-[11px] text-[var(--text-tertiary)]">{entry.sourceUrl}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] text-[var(--text-tertiary)]">
                    {entry.content.length.toLocaleString("es-AR")} chars
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : entry.id)}
                    className="shrink-0 rounded p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                    className="shrink-0 rounded p-1 text-[var(--text-tertiary)] hover:text-[#f87171] transition-colors"
                  >
                    {deletingId === entry.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </button>
                </div>
                {isExpanded && (
                  <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3">
                    <pre className="whitespace-pre-wrap text-[12px] leading-relaxed text-[var(--text-secondary)] font-mono max-h-[300px] overflow-y-auto">
                      {entry.content}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Plan hint */}
      {plan === "starter" && (
        <p className="text-[12px] text-[var(--text-tertiary)]">
          Plan Starter: hasta 10 entradas.{" "}
          <a href="/pricing" className="text-[var(--accent)] hover:underline">
            Upgradear a Pro para 30 →
          </a>
        </p>
      )}
    </div>
  );
}
