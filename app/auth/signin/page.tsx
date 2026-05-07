import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export const metadata = { title: "Iniciar sesión" };

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="relative hidden w-[42%] flex-col justify-between border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] px-10 py-12 lg:flex">
        <div>
          <Link href="/" className="font-syne text-xl font-extrabold tracking-[-0.03em] text-[var(--text-primary)]">
            MEET<span className="text-[var(--accent)]">ZY</span>
          </Link>
          <p className="mt-16 font-syne text-3xl font-bold leading-tight tracking-[-0.03em] text-[var(--text-primary)]">
            La web que entiende.
          </p>
          <ul className="mt-10 space-y-5 text-sm text-[var(--text-secondary)]">
            {[
              ["⚡", "Respuestas al instante, entrenadas en tu sitio."],
              ["🎯", "Detectá intención de compra antes del formulario."],
              ["🔗", "Instalación en una línea de código."],
            ].map(([icon, text]) => (
              <li key={text} className="flex gap-3">
                <span className="text-lg">{icon}</span>
                <span className="leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">Meetzy · Agentes conversacionales para equipos ambiciosos</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 text-center lg:hidden">
          <Link href="/" className="font-syne text-xl font-extrabold tracking-[-0.03em] text-[var(--text-primary)]">
            MEET<span className="text-[var(--accent)]">ZY</span>
          </Link>
        </div>
        <div className="w-full max-w-[400px]">
          <h1 className="mb-1 text-center font-syne text-2xl font-bold tracking-[-0.02em] text-[var(--text-primary)] lg:text-left">
            Bienvenido de vuelta
          </h1>
          <p className="mb-8 text-center text-sm text-[var(--text-secondary)] lg:text-left">Entrá a tu cuenta</p>
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                card: "bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-[var(--shadow-lg)] rounded-[var(--radius-xl)]",
                headerTitle: "text-[var(--text-primary)] font-syne",
                headerSubtitle: "text-[var(--text-secondary)]",
                socialButtonsBlockButton: "border-[var(--border-default)] bg-white text-neutral-900 hover:bg-neutral-100 rounded-[var(--radius-md)]",
                formButtonPrimary: "bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-[var(--radius-md)] shadow-[0_0_16px_rgba(99,102,241,0.25)]",
                formFieldInput: "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] rounded-[var(--radius-sm)]",
                footerActionLink: "text-[var(--accent)]",
                identityPreviewText: "text-[var(--text-primary)]",
                formFieldLabel: "text-[var(--text-secondary)]",
                dividerLine: "bg-[var(--border-subtle)]",
                dividerText: "text-[var(--text-tertiary)]",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
