import Link from "next/link";

const TABS = [
  { key: "overview", label: "Resumen", path: "" },
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
  return (
    <div className="mb-10">
      <nav className="dash-breadcrumb" aria-label="Migas de pan">
        <Link href="/dashboard">Mis sitios</Link>
        <span className="dash-breadcrumb-sep">/</span>
        <Link href={`/dashboard/${siteId}`} className="max-w-[200px] truncate sm:max-w-none">
          {siteName}
        </Link>
        {pageTitle ? (
          <>
            <span className="dash-breadcrumb-sep">/</span>
            <span className="text-[color:var(--c-text)]">{pageTitle}</span>
          </>
        ) : null}
      </nav>

      <div className="dash-subnav-rail" role="tablist" aria-label="Secciones del sitio">
        {TABS.map((t) => {
          const href = `/dashboard/${siteId}${t.path}`;
          const isActive = t.key === active;
          return (
            <Link
              key={t.key}
              href={href}
              role="tab"
              aria-selected={isActive}
              scroll={false}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
