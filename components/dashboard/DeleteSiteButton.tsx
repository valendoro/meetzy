"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProductToast } from "@/components/providers/product-toast";

type DeleteSiteButtonProps = {
  /** `siteId` público del widget (slug en URL del dashboard). */
  siteId: string;
  siteName: string;
  /** `card`: refresca la lista. `page`: vuelve al dashboard. */
  variant?: "card" | "page";
  className?: string;
};

export default function DeleteSiteButton({
  siteId,
  siteName,
  variant = "page",
  className = "",
}: DeleteSiteButtonProps) {
  const router = useRouter();
  const { push } = useProductToast();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const ok = window.confirm(
      `¿Eliminar “${siteName}”? Se borrarán todas las conversaciones y mensajes. Esta acción no se puede deshacer.`,
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/sites/${siteId}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        push(data.error ?? "No se pudo eliminar el sitio", "error");
        return;
      }
      push("Sitio y conversaciones eliminados", "success");
      if (variant === "card") {
        router.refresh();
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className={`text-sm font-medium transition-colors disabled:opacity-50 ${className}`}
    >
      {loading ? "Eliminando…" : "Eliminar sitio"}
    </button>
  );
}
