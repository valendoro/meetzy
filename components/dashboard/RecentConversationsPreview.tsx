"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useCallback, useEffect, useState } from "react";
import IntentBadge from "@/components/dashboard/IntentBadge";

type Row = {
  id: string;
  visitorId: string;
  createdAt: string;
  intentLabel: string;
  sessionDuration: number;
  messageCount: number;
  visitorEmail: string | null;
  preview: string;
};

function initialsFromRow(row: Row): string {
  if (row.visitorEmail?.trim()) {
    return row.visitorEmail.slice(0, 2).toUpperCase();
  }
  return row.visitorId.slice(-2).toUpperCase();
}

export default function RecentConversationsPreview({
  siteId,
  brandColor,
}: {
  siteId: string;
  brandColor: string;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/sites/${siteId}/conversations?page=1&intent=all`);
    if (r.ok) {
      const j = (await r.json()) as { items: Row[] };
      setRows(j.items.slice(0, 5));
    } else {
      setRows([]);
    }
    setLoading(false);
  }, [siteId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="dash-skeleton h-14" />
        <div className="dash-skeleton h-14" />
        <div className="dash-skeleton h-14" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-[color:var(--c-muted)]">
        Aún no hay conversaciones en este periodo. Instalá el widget para empezar a recibir chats.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.id}>
          <Link
            href={`/dashboard/${siteId}/conversations`}
            className="product-site-card flex items-center gap-3 p-3 no-underline"
          >
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[var(--text-primary)] ring-1 ring-[var(--border-default)]"
              style={{ backgroundColor: `color-mix(in srgb, ${brandColor} 35%, transparent)` }}
            >
              {initialsFromRow(row)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-medium text-[color:var(--c-text)]">
                  {row.visitorEmail?.trim() || `Visitante ${row.visitorId.slice(-6)}`}
                </span>
                <IntentBadge label={row.intentLabel} />
              </div>
              <p className="mt-0.5 truncate text-xs text-[color:var(--c-muted)]">{row.preview || "Sin preview"}</p>
              <p className="mt-1 text-[10px] text-[color:var(--c-muted2)]">
                {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true, locale: es })} · {row.messageCount}{" "}
                mensajes
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
