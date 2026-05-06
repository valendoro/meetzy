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
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
      <h2 className="font-syne font-bold text-lg text-[#F0EDE8] mb-5">
        Instalación
      </h2>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-[#0e0e0e] p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? "bg-accent text-white"
                : "text-[#6b6b6b] hover:text-[#F0EDE8]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <p className="text-sm text-[#6b6b6b] mb-3">{instructions[activeTab]}</p>

      {/* Code block */}
      <div className="relative">
        <pre className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl p-4 text-sm text-[#F0EDE8] font-mono overflow-x-auto">
          <code>{script}</code>
        </pre>
        <button
          onClick={copyScript}
          className={`absolute top-3 right-3 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            copied
              ? "bg-green-500/20 text-green-400"
              : "bg-[#1a1a1a] text-[#6b6b6b] hover:text-[#F0EDE8]"
          }`}
        >
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
      </div>

      <p className="text-xs text-[#444] mt-4">
        El widget se carga de forma asíncrona y no afecta el rendimiento de tu
        sitio.
      </p>
    </div>
  );
}
