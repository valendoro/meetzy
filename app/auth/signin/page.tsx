import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export const metadata = { title: "Iniciar sesión" };

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div
        className="relative hidden w-[40%] flex-col justify-between border-r border-[var(--border-subtle)] px-10 py-12 lg:flex"
        style={{
          background:
            "linear-gradient(165deg, rgba(99,102,241,0.14) 0%, transparent 55%), var(--bg-surface)",
        }}
      >
        <div>
          <Link href="/" className="font-syne text-lg font-extrabold tracking-[-0.04em] text-[var(--accent)]">
            MEETZY
          </Link>
          <p className="mt-14 font-syne text-[28px] font-bold leading-[1.15] tracking-[-0.03em] text-[var(--text-primary)]">
            La web que entiende.
          </p>
          <ul className="mt-10 space-y-5 text-[15px] font-light leading-relaxed text-[var(--text-secondary)]">
            {[
              ["⚡", "Respuestas al instante, entrenadas en tu sitio."],
              ["🎯", "Detectá intención antes del formulario."],
              ["🔗", "Instalación en una línea de código."],
            ].map(([icon, text]) => (
              <li key={text} className="flex gap-3">
                <span className="text-lg">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs font-light text-[var(--text-tertiary)]">Meetzy · Agentes conversacionales</p>
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-4 py-12 lg:w-[60%]">
        <div className="mb-8 text-center lg:hidden">
          <Link href="/" className="font-syne text-lg font-extrabold tracking-[-0.04em] text-[var(--accent)]">
            MEETZY
          </Link>
        </div>
        <div className="w-full max-w-[400px]">
          <h1 className="font-syne text-2xl font-bold tracking-[-0.02em] text-[var(--text-primary)] lg:text-left">
            Bienvenido
          </h1>
          <p className="mb-8 mt-2 text-sm font-light text-[var(--text-secondary)] lg:text-left">
            Entrá con Google o pedí un magic link. Sin contraseña.
          </p>
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                card: "rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-lg)]",
                headerTitle: "text-[var(--text-primary)] font-syne",
                headerSubtitle: "text-[var(--text-secondary)] font-light",
                socialButtonsBlockButton:
                  "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] rounded-[10px] h-12",
                formButtonPrimary:
                  "bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-[10px] shadow-[0_0_0_3px_rgba(99,102,241,0.2)]",
                formFieldInput:
                  "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] rounded-[10px] font-[family-name:var(--font-dm-sans)] font-light",
                footerActionLink: "text-[var(--accent)]",
                identityPreviewText: "text-[var(--text-primary)]",
                formFieldLabel: "text-[var(--text-secondary)] font-normal",
                dividerLine: "bg-[var(--border-subtle)]",
                dividerText: "text-[var(--text-tertiary)] text-xs font-light",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
