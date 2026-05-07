"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto py-16 px-4 text-center">
      <h1 className="font-syne font-bold text-xl text-[var(--text-primary)] mb-2">No pudimos cargar el dashboard</h1>
      <p className="text-sm mb-4 leading-relaxed text-[var(--text-secondary)]">
        Casi siempre es la base en Railway: falta una migración (columnas nuevas en <code className="font-mono text-[12px]">Site</code>) o{" "}
        <code className="rounded bg-[var(--surface-elevated)] px-1.5 py-0.5 font-mono text-[13px] text-[var(--accent)]">DATABASE_URL</code>{" "}
        no está referenciando el plugin Postgres del mismo proyecto. En Railway abrí <strong className="text-[var(--text-primary)]">Deployments → último deploy → Pre-deploy</strong> y buscá errores de{" "}
        <code className="font-mono text-[12px] text-[var(--text-tertiary)]">prisma migrate deploy</code>. Si falló, redeploy después de arreglar la URL; si no hay Pre-deploy, el servicio puede estar ignorando <code className="font-mono text-[11px]">railway.toml</code> — configurá el comando ahí o en Settings.
      </p>
      {process.env.NODE_ENV === "development" && error.message ? (
        <p className="text-left text-xs font-mono mb-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3 text-[var(--text-secondary)] break-words">
          {error.message}
        </p>
      ) : null}
      {error.digest ? (
        <p className="text-xs mb-6 font-mono text-[var(--text-tertiary)]">digest: {error.digest}</p>
      ) : null}
      <button type="button" onClick={reset} className="btn-primary">
        Reintentar
      </button>
    </div>
  );
}
