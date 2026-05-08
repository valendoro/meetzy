"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutGrid,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useCreateAgentModal } from "@/components/providers/create-agent-modal";
import { CreateAgentLauncher } from "@/components/dashboard/CreateAgentLauncher";

const DASH = "/dashboard";
const SIDEBAR_LS = "meetzy-sidebar-collapsed";

export type DashboardSiteOption = { siteId: string; name: string; agentName: string };

function navSiteBase(pathname: string): { siteId: string | null; sub: string } {
  if (!pathname.startsWith(`${DASH}/`) || pathname.startsWith(`${DASH}/new`)) {
    return { siteId: null, sub: "" };
  }
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return { siteId: null, sub: "" };
  const siteId = parts[1];
  if (siteId === "new") return { siteId: null, sub: "" };
  const rest = parts.slice(2).join("/");
  return { siteId, sub: rest };
}

export default function DashboardChrome({
  children,
  plan,
  displayName,
  email,
  sites,
}: {
  children: React.ReactNode;
  plan: string;
  displayName: string;
  email: string;
  sites: DashboardSiteOption[];
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { open: openCreateAgent } = useCreateAgentModal();
  const isOnboardingFullscreen = pathname === `${DASH}/new` || pathname.startsWith(`${DASH}/new/`);

  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try {
      const v = localStorage.getItem(SIDEBAR_LS);
      if (v === "1") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);
  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(SIDEBAR_LS, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  if (isOnboardingFullscreen) {
    return <>{children}</>;
  }

  const { siteId, sub } = navSiteBase(pathname);

  const siteNav = siteId
    ? ([
        ["", "Overview", LayoutGrid],
        ["/visitors", "Visitantes", Users],
        ["/conversations", "Conversaciones", MessageSquare],
        ["/analytics", "Analytics", BarChart3],
        ["/avatar", "Avatar", Sparkles],
        ["/settings", "Configuración", Settings],
        ["/install", "Instalación", Download],
      ] as const)
    : null;

  const bottomMobile = siteId
    ? [
        { href: `${DASH}/${siteId}`, key: "", label: "Resumen", Icon: LayoutGrid, action: "link" as const },
        { href: `${DASH}/${siteId}/install`, key: "install", label: "Instalar", Icon: Download, action: "link" as const },
        { href: `${DASH}/${siteId}/visitors`, key: "visitors", label: "Visitas", Icon: Users, action: "link" as const },
        { href: `${DASH}/${siteId}/conversations`, key: "conversations", label: "Chats", Icon: MessageSquare, action: "link" as const },
        { href: `${DASH}/${siteId}/analytics`, key: "analytics", label: "Data", Icon: BarChart3, action: "link" as const },
        { href: `${DASH}/${siteId}/settings`, key: "settings", label: "Más", Icon: Settings, action: "link" as const },
      ]
    : [
        { href: DASH, key: "", label: "Agentes", Icon: LayoutGrid, action: "link" as const },
        { href: "#", key: "new", label: "Nuevo", Icon: Bot, action: "create" as const },
        { href: "/pricing", key: "pricing", label: "Planes", Icon: BarChart3, action: "link" as const },
      ];

  const isSiteNavActive = (pathSuffix: string) => {
    if (!siteId) return false;
    if (pathSuffix === "") return sub === "" || sub === undefined || sub.length === 0;
    const seg = pathSuffix.slice(1);
    return sub === seg || sub.startsWith(`${seg}/`);
  };

  const onWorkspaceChange = (nextSiteId: string) => {
    if (!nextSiteId || nextSiteId === siteId) return;
    router.push(`${DASH}/${nextSiteId}`);
  };

  const dashSb = collapsed ? "56px" : "220px";

  return (
    <div
      className="meetzy-dash-root flex min-h-screen flex-col md:grid"
      style={{ ["--dash-sb" as string]: dashSb }}
    >
      <aside
        className={`dash-sidebar product-sidebar-shell sticky top-0 z-40 hidden h-screen shrink-0 flex-col md:flex ${
          collapsed ? "dash-sidebar--collapsed" : ""
        }`}
      >
        <div className="flex flex-1 flex-col overflow-hidden pb-3">
          {/* Logo + toggle */}
          <div
            className={`flex items-center border-b border-[var(--border-subtle)] px-3 ${
              collapsed ? "h-[52px] justify-center" : "h-[52px] justify-between"
            }`}
          >
            {!collapsed && (
              <Link
                href={DASH}
                className="font-syne text-[18px] font-extrabold tracking-[-0.04em] text-[var(--accent)] transition-opacity duration-150 hover:opacity-80"
              >
                MEETZY
              </Link>
            )}
            {collapsed && (
              <Link
                href={DASH}
                className="font-syne text-[18px] font-extrabold tracking-[-0.04em] text-[var(--accent)] transition-opacity duration-150 hover:opacity-80"
                title="Meetzy · Inicio"
              >
                M
              </Link>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={toggleCollapsed}
                className="dash-focus-ring flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)] transition-all duration-150 hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                aria-label="Colapsar barra lateral"
              >
                <ChevronLeft className="size-3.5" strokeWidth={2} />
              </button>
            )}
          </div>

          {collapsed && (
            <div className="flex justify-center border-b border-[var(--border-subtle)] py-2">
              <button
                type="button"
                onClick={toggleCollapsed}
                className="dash-focus-ring flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)] transition-all duration-150 hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                aria-label="Expandir barra lateral"
              >
                <ChevronRight className="size-3.5" strokeWidth={2} />
              </button>
            </div>
          )}

          {/* Workspace selector */}
          {sites.length > 0 && siteId && !collapsed ? (
            <div className="px-3 pt-3">
              <p className="dash-section-label mt-0">Agente activo</p>
              <select
                value={siteId}
                onChange={(e) => onWorkspaceChange(e.target.value)}
                className="mt-1 h-8 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 text-[12px] text-[var(--text-primary)] transition-colors duration-150 focus:border-[var(--border-focus)] focus:outline-none"
              >
                {sites.map((s) => (
                  <option key={s.siteId} value={s.siteId}>
                    {s.agentName || s.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* Nav */}
          <nav className="flex flex-1 flex-col px-2 pt-3 gap-1" aria-label="Principal">
            {!collapsed && (
              <p className="dash-section-label mt-0">General</p>
            )}
            <Link
              href={DASH}
              data-active={pathname === DASH || pathname === `${DASH}/` ? "true" : "false"}
              className="product-sidebar-link"
              title={collapsed ? "Mis agentes" : undefined}
            >
              <LayoutGrid className="size-4 shrink-0" strokeWidth={1.75} />
              <span className="dash-sidebar-label">Mis agentes</span>
            </Link>
            <CreateAgentLauncher
              variant="ghost"
              className="product-sidebar-link h-auto w-full justify-start px-[10px] font-normal"
              title={collapsed ? "Crear agente" : undefined}
            >
              <Bot className="size-4 shrink-0 opacity-90" strokeWidth={1.75} />
              <span className="dash-sidebar-label">Crear agente</span>
            </CreateAgentLauncher>
            <Link
              href="/pricing"
              className="product-sidebar-link"
              data-active="false"
              title={collapsed ? "Planes" : undefined}
            >
              <ChevronRight className="size-4 shrink-0 opacity-90" strokeWidth={1.75} />
              <span className="dash-sidebar-label">Planes</span>
            </Link>

            {siteNav ? (
              <>
                <div className="my-2 h-px bg-[var(--border-subtle)]" />
                {!collapsed && (
                  <p className="dash-section-label mt-0">Por agente</p>
                )}
                {siteNav.map(([suffix, label, Icon]) => {
                  const href = `${DASH}/${siteId}${suffix}`;
                  const active = isSiteNavActive(suffix);
                  return (
                    <Link
                      key={suffix || "root"}
                      href={href}
                      data-active={active ? "true" : "false"}
                      className="product-sidebar-link"
                      title={collapsed ? label : undefined}
                    >
                      <Icon className="size-4 shrink-0 opacity-90" strokeWidth={1.75} />
                      <span className="dash-sidebar-label">{label}</span>
                    </Link>
                  );
                })}
              </>
            ) : null}
          </nav>

          {/* Bottom user panel */}
          <div className="mt-auto px-2 pb-1">
            {!collapsed ? (
              <>
                <div className="product-user-panel flex items-center gap-2.5 px-3 py-2.5">
                  <UserButton
                    appearance={{
                      elements: { userButtonAvatarBox: "size-7 rounded-full" },
                    }}
                  />
                  <div className="min-w-0 flex-1 dash-sidebar-label">
                    <p className="truncate text-[12px] font-medium text-[var(--text-primary)]">
                      {displayName || email}
                    </p>
                    <p className="truncate text-[10px] text-[var(--text-tertiary)]">{email}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between px-1">
                  <span
                    className="rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-overlay)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)]"
                  >
                    {plan}
                  </span>
                  <Link
                    href="/pricing"
                    className="text-[11px] font-medium text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
                  >
                    Billing →
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex justify-center py-2">
                <UserButton
                  appearance={{
                    elements: { userButtonAvatarBox: "size-7 rounded-full" },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto pb-16 md:pb-0">
        <main className="dash-page-enter mx-auto w-full max-w-[1280px] flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          {children}
        </main>
      </div>

      <nav className="product-bottom-nav md:hidden" aria-label="Móvil">
        {bottomMobile.map((item) => {
          const active =
            item.action === "create"
              ? false
              : siteId && item.key !== "pricing"
                ? item.key === ""
                  ? pathname === `${DASH}/${siteId}` || pathname === `${DASH}/${siteId}/`
                  : pathname.includes(`/${siteId}/${item.key}`)
                : item.key === ""
                  ? pathname === DASH
                  : pathname.includes(item.key) && item.key !== "pricing";
          if (item.action === "create") {
            return (
              <button
                key={item.key}
                type="button"
                onClick={openCreateAgent}
                className="min-w-[56px] flex flex-col items-center gap-0.5 border-0 bg-transparent text-[10px] font-medium text-[var(--text-tertiary)]"
              >
                <item.Icon className="mx-auto size-5" strokeWidth={1.75} />
                {item.label}
              </button>
            );
          }
          return (
            <Link key={item.href} href={item.href} data-active={active ? "true" : "false"} className="min-w-[56px]">
              <item.Icon className="mx-auto size-5" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
}
