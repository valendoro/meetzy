"use client";

import { useState } from "react";

interface InstallScriptProps {
  siteId: string;
  appUrl: string;
}

const TABS = ["HTML", "Webflow", "WordPress", "Shopify"] as const;
type Tab = (typeof TABS)[number];

export default function InstallScript({ siteId, appUrl }: InstallScriptProps) {
  const [activeTab, setActiveTab] = useState<Tab>("HTML");
  const [copied, setCopied] = useState(false);

  const script = `<script>
  window.MEETZYCONFIG = { siteId: "${siteId}" };
</script>
<script src="${appUrl}/widget.js" async></script>`;

  const instructions: Record<Tab, string> = {
    HTML: `Pegá este código antes del </body> en tu HTML:`,
    Webflow: `En Webflow, andá a Project Settings → Custom Code → Footer Code y pegá:`,
    WordPress: `En WordPress, usá un plugin de "Insert Headers and Footers" y pegá en el footer:`,
    Shopify: `En Shopify, andá a Online Store → Themes → Edit code → theme.liquid, antes del </body>:`,
  };

  function copyScript() {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="dash-card p-6 pl-7">
      <h2 className="dash-chart-head mb-4 text-[1.05rem]">Instalación</h2>

      <div className="dash-segmented mb-5 w-full sm:w-auto">
        {TABS.map((tab) => (
          <button key={tab} type="button" data-active={activeTab === tab ? "true" : "false"} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <p className="mb-3 text-sm leading-relaxed text-[color:var(--c-muted)]">{instructions[activeTab]}</p>

      <div className="relative">
        <pre className="max-h-[min(280px,45vh)] overflow-auto rounded-[var(--radius-md)] border border-[color:var(--c-border)] bg-[color:var(--c-bg-subtle)] p-4 font-mono text-[13px] leading-relaxed text-[color:var(--c-text)] [scrollbar-color:rgba(124,108,255,0.35)_transparent]">
          <code>{script}</code>
        </pre>
        <button
          type="button"
          onClick={copyScript}
          className={`absolute right-3 top-3 text-xs font-semibold transition-colors ${
            copied
              ? "rounded-lg bg-[color:var(--c-green)]/15 px-3 py-1.5 text-[color:var(--c-green)]"
              : "btn-ghost btn-ghost--sm !px-3 !py-1.5"
          }`}
        >
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[color:var(--c-muted2)]">
        El widget se carga de forma asíncrona y no afecta el rendimiento de tu sitio.
      </p>
    </div>
  );
}
