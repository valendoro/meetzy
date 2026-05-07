import Link from "next/link";

const TABS = [
  { key: "overview", label: "Resumen", path: "" },
  { key: "install", label: "Instalación", path: "/install" },
  { key: "visitors", label: "Visitantes", path: "/visitors" },
  { key: "conversations", label: "Conversaciones", path: "/conversations" },
  { key: "analytics", label: "Analytics", path: "/analytics" },
  { key: "avatar", label: "Avatar", path: "/avatar" },
  { key: "settings", label: "Configuración", path: "/settings" },
] as const;

export type SiteSubnavTab = (typeof TABS)[number]["key"];

export default function SiteSubnav({
  siteId,
  siteName,
  active,
  pageTitle,
}: {
  siteId: string;
  siteName: string;
  active: SiteSubnavTab;
  pageTitle?: string;
}) {
  const base = `/dashboard/${siteId}`;

  return (
    <div className="mb-10">
      <nav className="product-breadcrumb" aria-label="Migas de pan">
        <Link href="/dashboard">Mis agentes</Link>
        <span className="text-[var(--text-tertiary)]">/</span>
        <Link href={base} className="max-w-[220px] truncate sm:max-w-none">
          {siteName}
        </Link>
        {pageTitle ? (
          <>
            <span className="text-[var(--text-tertiary)]">/</span>
            <span className="text-[var(--text-primary)]">{pageTitle}</span>
          </>
        ) : null}
      </nav>

      <div className="product-tabs-rail" role="tablist" aria-label="Secciones del sitio">
        {TABS.map((t) => {
          const href = `${base}${t.path}`;
          const isActive = t.key === active;
          return (
            <Link key={t.key} href={href} role="tab" aria-selected={isActive} scroll={false} data-active={isActive ? "true" : "false"}>
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
