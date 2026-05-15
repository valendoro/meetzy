"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { StickyNote, Send, Trash2, Loader2 } from "lucide-react";
import { useProductToast } from "@/components/providers/product-toast";

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export default function VisitorNotes({
  sitePublicId,
  visitorId,
}: {
  sitePublicId: string;
  visitorId: string;
}) {
  const { push } = useProductToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const apiBase = `/api/sites/${sitePublicId}/visitors/${visitorId}/notes`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(apiBase);
      if (r.ok) {
        const j = (await r.json()) as { notes: Note[] };
        setNotes(j.notes);
      }
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => { void load(); }, [load]);

  async function handleAdd() {
    const content = text.trim();
    if (!content) return;
    setSaving(true);
    try {
      const r = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (r.ok) {
        const j = (await r.json()) as { note: Note };
        setNotes((prev) => [j.note, ...prev]);
        setText("");
        textareaRef.current?.focus();
      } else {
        push("No se pudo guardar la nota", "error");
      }
    } catch {
      push("Error de red", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId: string) {
    setDeletingId(noteId);
    try {
      const r = await fetch(`${apiBase}/${noteId}`, { method: "DELETE" });
      if (r.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        push("Nota eliminada", "success");
      } else {
        push("No se pudo eliminar la nota", "error");
      }
    } catch {
      push("Error de red", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <StickyNote className="size-4 text-[var(--text-tertiary)]" />
        <h2 className="dash-chart-head mb-0">Notas internas</h2>
        {notes.length > 0 && (
          <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-overlay)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-tertiary)]">
            {notes.length}
          </span>
        )}
      </div>

      {/* Input */}
      <div className="mb-4 flex flex-col gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleAdd();
          }}
          placeholder="Añadí una nota sobre este visitante… (Cmd+Enter para guardar)"
          rows={3}
          className="dash-input w-full resize-none text-[13px] leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-[var(--text-tertiary)]">Solo visible para vos · no se muestra al visitante</p>
          <button
            type="button"
            onClick={() => void handleAdd()}
            disabled={saving || !text.trim()}
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--accent)] px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            Guardar
          </button>
        </div>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="space-y-2">
          <div className="dash-skeleton h-14" />
          <div className="dash-skeleton h-10" />
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--bg-overlay)] px-4 py-6 text-center">
          <p className="text-[12px] text-[var(--text-tertiary)]">Sin notas aún. Usá las notas para recordar contexto, follow-ups o detalles importantes.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li
              key={note.id}
              className="group flex gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-3.5 py-3 transition-colors hover:border-[var(--border-default)]"
            >
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--text-primary)]">
                  {note.content}
                </p>
                <p className="mt-1.5 text-[10px] text-[var(--text-tertiary)]">
                  {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: es })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleDelete(note.id)}
                disabled={deletingId === note.id}
                className="shrink-0 self-start rounded-[var(--radius-sm)] p-1 text-[var(--text-tertiary)] opacity-0 transition-all group-hover:opacity-100 hover:bg-[rgba(248,113,113,0.12)] hover:text-[#f87171] disabled:opacity-40"
                aria-label="Eliminar nota"
              >
                {deletingId === note.id
                  ? <Loader2 className="size-3.5 animate-spin" />
                  : <Trash2 className="size-3.5" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
