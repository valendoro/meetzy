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
  const current = TABS.find((t) => t.key === active);

  return (
    <div className="mb-10">
      <nav className="product-breadcrumb font-[family-name:var(--font-dm-sans)] text-[13px] font-light" aria-label="Migas de pan">
        <Link href="/dashboard" className="dash-focus-ring rounded-md">
          Mis agentes
        </Link>
        <span className="text-[var(--text-tertiary)]">/</span>
        <Link href={base} className="max-w-[220px] truncate sm:max-w-none dash-focus-ring rounded-md">
          {siteName}
        </Link>
        {current ? (
          <>
            <span className="text-[var(--text-tertiary)]">/</span>
            <span className="text-[var(--text-primary)]">{pageTitle ?? current.label}</span>
          </>
        ) : null}
      </nav>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-tertiary)]">{current?.label}</p>
    </div>
  );
}
