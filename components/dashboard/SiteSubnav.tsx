import Link from "next/link";

const TABS = [
  { key: "overview", label: "Resumen", path: "" },
  { key: "visitors", label: "Visitantes", path: "/visitors" },
  { key: "conversations", label: "Conversaciones", path: "/conversations" },
  { key: "analytics", label: "Analytics", path: "/analytics" },
  { key: "knowledge", label: "Conocimiento", path: "/knowledge" },
  { key: "test", label: "Probar", path: "/test" },
  { key: "avatar", label: "Avatar", path: "/avatar" },
  { key: "settings", label: "Configuración", path: "/settings" },
  { key: "install", label: "Instalación", path: "/install" },
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
    knowledge: "Lo que el agente sabe sobre tu negocio: precios, FAQs, servicios y más.",
    test: "Chateá con tu agente en tiempo real para validar respuestas.",
    avatar: "Tipo de avatar, colores de marca y logo para el agente.",
    settings: "Tono, reglas y datos que usa el agente en el sitio.",
  };

  const blurb =
    description === null ? null : description ?? (current ? defaultDescriptions[current.key] : null);

  return (
    <header className="mb-16 print:mb-8">
      {/* Breadcrumb */}
      <nav
        className="mb-7 flex flex-wrap items-center gap-2 font-[family-name:var(--font-dm-sans)] text-[13px] font-light"
        aria-label="Migas de pan"
      >
        <Link
          href="/dashboard"
          className="text-[var(--text-tertiary)] transition-colors duration-150 hover:text-[var(--text-primary)] dash-focus-ring rounded-[4px]"
        >
          Mis agentes
        </Link>
        <span className="text-[var(--text-tertiary)] opacity-40">/</span>
        <Link
          href={base}
          className="max-w-[220px] truncate text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--text-primary)] sm:max-w-none dash-focus-ring rounded-[4px]"
        >
          {siteName}
        </Link>
      </nav>

      {heading ? (
        <div>
          <div className="mb-10 flex flex-col gap-2.5">
            <h1 className="font-syne text-[26px] font-extrabold leading-tight tracking-[-1.5px] text-[var(--text-primary)] sm:text-[30px]">
              {heading}
            </h1>
            {blurb ? (
              <p className="max-w-2xl font-[family-name:var(--font-dm-sans)] text-[14px] font-light leading-relaxed text-[var(--text-secondary)]">
                {blurb}
              </p>
            ) : null}
          </div>

          {/* Tabs */}
          <div className="product-tabs-rail overflow-x-auto [&::-webkit-scrollbar]:h-0">
            {TABS.map((tab) => {
              const href = tab.path ? `${base}${tab.path}` : base;
              const isActive = active === tab.key;
              return (
                <Link
                  key={tab.key}
                  href={href}
                  data-active={isActive ? "true" : "false"}
                  className="shrink-0"
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
  );
}
