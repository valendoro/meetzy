"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  ChevronRight,
  Download,
  LayoutGrid,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { ProductToastProvider } from "@/components/providers/product-toast";

const DASH = "/dashboard";

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
}: {
  children: React.ReactNode;
  plan: string;
  displayName: string;
  email: string;
}) {
  const pathname = usePathname() ?? "";
  const isOnboardingFullscreen = pathname === `${DASH}/new` || pathname.startsWith(`${DASH}/new/`);

  if (isOnboardingFullscreen) {
    return <ProductToastProvider>{children}</ProductToastProvider>;
  }

  const { siteId, sub } = navSiteBase(pathname);

  const siteNav = siteId
    ? ([
        ["", "Resumen", LayoutGrid],
        ["/install", "Instalación", Download],
        ["/visitors", "Visitantes", Users],
        ["/conversations", "Conversaciones", MessageSquare],
        ["/analytics", "Analytics", BarChart3],
        ["/avatar", "Avatar", Sparkles],
        ["/settings", "Configuración", Settings],
      ] as const)
    : null;

  const bottomMobile = siteId
    ? [
        { href: `${DASH}/${siteId}`, key: "", label: "Resumen", Icon: LayoutGrid },
        { href: `${DASH}/${siteId}/install`, key: "install", label: "Instalar", Icon: Download },
        { href: `${DASH}/${siteId}/visitors`, key: "visitors", label: "Visitas", Icon: Users },
        { href: `${DASH}/${siteId}/conversations`, key: "conversations", label: "Chats", Icon: MessageSquare },
        { href: `${DASH}/${siteId}/analytics`, key: "analytics", label: "Data", Icon: BarChart3 },
        { href: `${DASH}/${siteId}/settings`, key: "settings", label: "Más", Icon: Settings },
      ]
    : [
        { href: DASH, key: "", label: "Agentes", Icon: LayoutGrid },
        { href: `${DASH}/new`, key: "new", label: "Nuevo", Icon: Bot },
        { href: "/pricing", key: "pricing", label: "Planes", Icon: BarChart3 },
      ];

  const isSiteNavActive = (pathSuffix: string) => {
    if (!siteId) return false;
    if (pathSuffix === "") return sub === "" || sub === undefined || sub.length === 0;
    const seg = pathSuffix.slice(1);
    return sub === seg || sub.startsWith(`${seg}/`);
  };

  return (
    <ProductToastProvider>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside
          className="sticky top-0 z-40 hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] md:flex"
          style={{ paddingTop: 12 }}
        >
          <div className="flex flex-1 flex-col px-3 pb-4">
            <Link
              href={DASH}
              className="mb-6 flex items-center gap-2 px-2 font-syne text-lg font-extrabold tracking-[-0.03em] text-[var(--text-primary)]"
            >
              MEET<span className="text-[var(--accent)]">ZY</span>
            </Link>

            <nav className="flex flex-1 flex-col gap-1 text-[13px]" aria-label="Principal">
              <Link
                href={DASH}
                data-active={pathname === DASH || pathname === `${DASH}/` ? "true" : "false"}
                className="product-sidebar-link"
              >
                <LayoutGrid className="size-4 opacity-80" strokeWidth={1.75} />
                Mis agentes
              </Link>
              <Link href={`${DASH}/new`} data-active={pathname.startsWith(`${DASH}/new`) ? "true" : "false"} className="product-sidebar-link">
                <Bot className="size-4 opacity-80" strokeWidth={1.75} />
                Nuevo agente
              </Link>
              <Link href="/pricing" className="product-sidebar-link" data-active="false">
                <ChevronRight className="size-4 opacity-80" strokeWidth={1.75} />
                Planes
              </Link>

              {siteNav ? (
                <>
                  <div className="my-3 h-px bg-[var(--border-subtle)]" />
                  <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Sitio
                  </p>
                  {siteNav.map(([suffix, label, Icon]) => {
                    const href = `${DASH}/${siteId}${suffix}`;
                    const active = isSiteNavActive(suffix);
                    return (
                      <Link key={suffix || "root"} href={href} data-active={active ? "true" : "false"} className="product-sidebar-link">
                        <Icon className="size-4 opacity-80" strokeWidth={1.75} />
                        {label}
                      </Link>
                    );
                  })}
                </>
              ) : null}
            </nav>

            <div className="mt-auto space-y-3 border-t border-[var(--border-subtle)] pt-4">
              <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-2">
                <UserButton
                  appearance={{
                    elements: { userButtonAvatarBox: "size-9" },
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[var(--text-primary)]">{displayName || email}</p>
                  <p className="truncate text-[10px] text-[var(--text-tertiary)]">{email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  {plan}
                </span>
                <Link href="/pricing" className="text-[11px] font-medium text-[var(--accent)] hover:underline">
                  Billing
                </Link>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
          <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>

        {/* Mobile bottom nav */}
        <nav className="product-bottom-nav md:hidden" aria-label="Móvil">
          {bottomMobile.map(({ href, key, label, Icon }) => {
            const active =
              siteId && key !== "pricing"
                ? key === ""
                  ? pathname === `${DASH}/${siteId}` || pathname === `${DASH}/${siteId}/`
                  : pathname.includes(`/${siteId}/${key}`)
                : key === ""
                  ? pathname === DASH
                  : pathname.includes(key) && key !== "pricing";
            return (
              <Link key={href} href={href} data-active={active ? "true" : "false"} className="min-w-[56px]">
                <Icon className="mx-auto size-5" strokeWidth={1.75} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </ProductToastProvider>
  );
}
