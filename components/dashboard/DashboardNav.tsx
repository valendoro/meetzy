"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

interface HotLead {
  conversationId: string;
  siteId: string;
  siteName: string;
  visitorName: string | null;
  visitorEmail: string | null;
  intentLabel: string;
  intentScore: number;
  createdAt: string;
}

const INTENT_EMOJI: Record<string, string> = {
  hot_lead: "🔥",
  ready_to_buy: "⭐",
};

export default function DashboardNav() {
  const { user } = useUser();
  const displayName =
    user?.fullName || user?.primaryEmailAddress?.emailAddress || user?.username || "Usuario";

  const [hotLeads, setHotLeads] = useState<HotLead[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchNotifs() {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = (await res.json()) as { hotLeads: HotLead[]; total: number };
        setHotLeads(data.hotLeads ?? []);
      } catch {
        // ignore
      }
    }
    void fetchNotifs();
    // Poll every 90 seconds
    const id = setInterval(() => void fetchNotifs(), 90_000);
    return () => clearInterval(id);
  }, []);

  const count = hotLeads.length;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        backgroundColor: "rgba(11, 10, 15, 0.92)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        className="wrap"
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/dashboard" className="logo-mark">
          MEET<span>ZY</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-[0.875rem]" aria-label="Principal">
          {[
            ["Mis sitios", "/dashboard"],
            ["Nuevo agente", "/dashboard/new"],
            ["Planes", "/pricing"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              style={{
                color: "rgba(243, 241, 236, 0.58)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "rgba(243, 241, 236, 0.58)";
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Notification bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="relative flex size-8 items-center justify-center rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all"
              title="Notificaciones"
            >
              <Bell className="size-4" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#f97316] text-[9px] font-bold text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            {open && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                {/* Dropdown */}
                <div className="absolute right-0 top-10 z-50 w-80 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)] overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
                    <p className="text-[12px] font-semibold text-[var(--text-primary)]">
                      Hot leads · últimas 24hs
                    </p>
                    <span className="text-[11px] text-[var(--text-tertiary)]">{count} nuevos</span>
                  </div>

                  {count === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-[13px] text-[var(--text-secondary)]">Sin hot leads recientes 🎯</p>
                      <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">Te notificamos acá cuando aparezcan</p>
                    </div>
                  ) : (
                    <ul className="max-h-72 overflow-y-auto">
                      {hotLeads.map((lead) => (
                        <li key={lead.conversationId}>
                          <Link
                            href={`/dashboard/${lead.siteId}/visitors`}
                            onClick={() => setOpen(false)}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-overlay)] transition-colors"
                          >
                            <span className="mt-0.5 text-base">
                              {INTENT_EMOJI[lead.intentLabel] ?? "⭐"}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[12px] font-medium text-[var(--text-primary)]">
                                {lead.visitorName || lead.visitorEmail || "Visitante anónimo"}
                              </p>
                              <p className="truncate text-[11px] text-[var(--text-tertiary)]">
                                {lead.siteName} · score {lead.intentScore}
                              </p>
                            </div>
                            <span className="shrink-0 text-[10px] text-[var(--text-tertiary)]">
                              {new Date(lead.createdAt).toLocaleTimeString("es-AR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="border-t border-[var(--border-subtle)] px-4 py-2.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="text-[11px] text-[var(--accent)] hover:underline"
                    >
                      Ver todos los visitantes →
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          <Link
            href="/dashboard/new"
            className="btn-primary"
            style={{ textDecoration: "none", fontSize: "0.8rem", padding: "0.5rem 1rem" }}
          >
            + Nuevo
          </Link>
          <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>{displayName.split(" ")[0]}</span>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
