"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { Bell, Menu, X } from "lucide-react";

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

const NAV_LINKS = [
  ["Mis sitios", "/dashboard"],
  ["Nuevo agente", "/dashboard/new"],
  ["Planes", "/pricing"],
] as const;

export default function DashboardNav() {
  const { user } = useUser();
  const displayName =
    user?.fullName || user?.primaryEmailAddress?.emailAddress || user?.username || "Usuario";

  const [hotLeads, setHotLeads] = useState<HotLead[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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
    const id = setInterval(() => void fetchNotifs(), 90_000);
    return () => clearInterval(id);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    function handler(e: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const count = hotLeads.length;

  return (
    <>
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
          style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <Link href="/dashboard" className="logo-mark">
            MEET<span>ZY</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8 text-[0.875rem]" aria-label="Principal">
            {NAV_LINKS.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                style={{ color: "rgba(243, 241, 236, 0.58)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(243, 241, 236, 0.58)"; }}
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
                onClick={() => setNotifOpen((v) => !v)}
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

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-10 z-50 w-80 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)] overflow-hidden">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
                      <p className="text-[12px] font-semibold text-[var(--text-primary)]">Hot leads · últimas 24hs</p>
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
                              onClick={() => setNotifOpen(false)}
                              className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-overlay)] transition-colors"
                            >
                              <span className="mt-0.5 text-base">{INTENT_EMOJI[lead.intentLabel] ?? "⭐"}</span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[12px] font-medium text-[var(--text-primary)]">
                                  {lead.visitorName || lead.visitorEmail || "Visitante anónimo"}
                                </p>
                                <p className="truncate text-[11px] text-[var(--text-tertiary)]">
                                  {lead.siteName} · score {lead.intentScore}
                                </p>
                              </div>
                              <span className="shrink-0 text-[10px] text-[var(--text-tertiary)]">
                                {new Date(lead.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="border-t border-[var(--border-subtle)] px-4 py-2.5">
                      <Link href="/dashboard" onClick={() => setNotifOpen(false)} className="text-[11px] text-[var(--accent)] hover:underline">
                        Ver todos los visitantes →
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Desktop: new + user */}
            <Link
              href="/dashboard/new"
              className="btn-primary hidden lg:inline-flex"
              style={{ textDecoration: "none", fontSize: "0.8rem", padding: "0.5rem 1rem" }}
            >
              + Nuevo
            </Link>
            <Link
              href="/dashboard/account"
              className="hidden lg:inline"
              style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"; }}
            >
              {displayName.split(" ")[0]}
            </Link>
            <UserButton />

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex lg:hidden size-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all"
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[rgba(4,4,8,0.7)] backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <div
            ref={mobileMenuRef}
            className="absolute top-0 right-0 h-full w-[280px] flex flex-col border-l border-[var(--border-default)] bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)]"
            style={{ animation: "slideInRight 0.22s cubic-bezier(0.22,1,0.36,1)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
              <span className="logo-mark text-sm">MEET<span>ZY</span></span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex size-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-1 p-4">
              {NAV_LINKS.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center rounded-[var(--radius-md)] px-3 py-3 text-[14px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="mx-4 border-t border-[var(--border-subtle)]" />

            {/* CTA */}
            <div className="p-4">
              <Link
                href="/dashboard/new"
                onClick={() => setMobileOpen(false)}
                className="btn-primary flex items-center justify-center gap-2 w-full text-center"
                style={{ textDecoration: "none", fontSize: "0.875rem", padding: "0.65rem 1rem" }}
              >
                + Nuevo agente
              </Link>
            </div>

            {/* User info */}
            <div className="mt-auto border-t border-[var(--border-subtle)] px-5 py-4 flex items-center gap-3">
              <UserButton />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">{displayName}</p>
                <Link
                  href="/dashboard/account"
                  onClick={() => setMobileOpen(false)}
                  className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
                >
                  Mi cuenta
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.6; }
          to   { transform: translateX(0);    opacity: 1;   }
        }
      `}</style>
    </>
  );
}
