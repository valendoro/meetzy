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
  description,
}: {
  siteId: string;
  siteName: string;
  active: SiteSubnavTab;
  pageTitle?: string;
  /** Si se pasa, reemplaza el texto de apoyo bajo el título. `null` = sin párrafo. */
  description?: string | null;
}) {
  const base = `/dashboard/${siteId}`;
  const current = TABS.find((t) => t.key === active);
  const heading = pageTitle ?? current?.label ?? "";

  const defaultDescriptions: Record<SiteSubnavTab, string> = {
    overview: "Resumen de conversaciones, intención y rendimiento de este agente.",
    install: "Script y checklist para publicar el widget en tu web.",
    visitors: "Perfiles, historial y señales de compra de quienes interactuaron con el widget.",
    conversations: "Cada chat con preview, intención y acceso al transcript.",
    analytics: "Embudo, calor horario y preguntas frecuentes agregadas.",
    avatar: "Tipo de avatar, colores de marca y logo para el agente.",
    settings: "Tono, reglas y datos que usa el agente en el sitio.",
  };

  const blurb =
    description === null ? null : description ?? (current ? defaultDescriptions[current.key] : null);

  return (
    <header className="mb-10 space-y-4">
      <nav className="product-breadcrumb mb-0 font-[family-name:var(--font-dm-sans)] text-[13px] font-light" aria-label="Migas de pan">
        <Link href="/dashboard" className="dash-focus-ring rounded-md">
          Mis agentes
        </Link>
        <span className="text-[var(--text-tertiary)]">/</span>
        <Link href={base} className="max-w-[220px] truncate sm:max-w-none dash-focus-ring rounded-md">
          {siteName}
        </Link>
      </nav>
      {heading ? (
        <div className="flex flex-col gap-1 border-b border-[var(--border-subtle)] pb-6">
          <h1 className="font-syne text-[1.65rem] font-extrabold leading-tight tracking-[-0.04em] text-[var(--text-primary)] sm:text-[1.85rem]">
            {heading}
          </h1>
          {blurb ? (
            <p className="max-w-2xl text-[14px] font-light leading-relaxed text-[var(--text-secondary)]">{blurb}</p>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
