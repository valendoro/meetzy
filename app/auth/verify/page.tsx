import Link from "next/link";

export const metadata = { title: "Revisá tu email" };

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="mb-10 font-syne text-xl font-extrabold tracking-[-0.03em] text-[var(--text-primary)]">
        MEET<span className="text-[var(--accent)]">ZY</span>
      </Link>

      <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-8 py-12 text-center shadow-[var(--shadow-lg)]">
        <div className="relative mx-auto mb-8 flex size-20 items-center justify-center rounded-full bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-border)]">
          <span className="text-3xl" aria-hidden>
            ✉️
          </span>
          <span className="absolute -right-1 -top-1 flex size-6 animate-pulse items-center justify-center rounded-full bg-[var(--accent)] text-xs text-white">
            ···
          </span>
        </div>

        <h1 className="font-syne text-2xl font-bold tracking-[-0.02em] text-[var(--text-primary)]">Revisá tu email</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          Te enviamos un link de acceso. Hacé clic en el enlace para entrar a tu cuenta de Meetzy.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="https://mail.google.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-overlay)]"
          >
            Abrir Gmail
          </a>
          <a
            href="https://outlook.live.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-overlay)]"
          >
            Abrir Outlook
          </a>
        </div>
        <p className="mt-8 text-xs text-[var(--text-tertiary)]">El link expira en 24 horas. Si no lo ves, revisá spam.</p>
      </div>

      <Link href="/auth/signin" className="mt-8 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
        ← Usar otra cuenta
      </Link>
    </div>
  );
}
