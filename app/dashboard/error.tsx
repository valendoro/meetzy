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
      <h1 className="font-syne font-bold text-xl text-[#eceae5] mb-2">No pudimos cargar el dashboard</h1>
      <p className="text-sm mb-6" style={{ color: "rgba(236,234,229,0.45)" }}>
        Suele deberse a la base de datos (tablas sin crear o <code className="text-accent">DATABASE_URL</code>{" "}
        incorrecta en Railway). Revisá los logs del deploy y que exista la migración aplicada.
      </p>
      {error.digest ? (
        <p className="text-xs mb-6 font-mono" style={{ color: "rgba(236,234,229,0.35)" }}>
          digest: {error.digest}
        </p>
      ) : null}
      <button type="button" onClick={reset} className="btn-primary">
        Reintentar
      </button>
    </div>
  );
}
