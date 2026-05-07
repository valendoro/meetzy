import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function ClerkSignInPage() {
  return (
    <div className="meetzy-product-ui flex min-h-screen flex-col lg:flex-row">
      <div className="relative hidden w-[40%] flex-col justify-between border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] px-10 py-12 lg:flex">
        <div>
          <p className="font-syne text-2xl font-extrabold tracking-[-0.03em] text-[var(--text-primary)]">
            MEET<span className="text-[var(--accent)]">ZY</span>
          </p>
          <p className="mt-12 font-syne text-2xl font-bold leading-tight tracking-[-0.02em] text-[var(--text-primary)]">
            La web que entiende.
          </p>
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">Seguro · Rápido · Diseñado para conversión</p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <Link
          href="/"
          className="mb-8 font-syne text-xl font-extrabold tracking-[-0.03em] text-[var(--text-primary)] lg:hidden"
        >
          MEET<span className="text-[var(--accent)]">ZY</span>
        </Link>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto w-full max-w-[400px]",
              card: "bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-[var(--shadow-lg)] rounded-[var(--radius-xl)]",
              headerTitle: "text-[var(--text-primary)] font-syne",
              headerSubtitle: "text-[var(--text-secondary)]",
              socialButtonsBlockButton:
                "border-[var(--border-default)] bg-white text-neutral-900 hover:bg-neutral-100 rounded-[var(--radius-md)]",
              formButtonPrimary:
                "bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-[var(--radius-md)] shadow-[0_0_16px_rgba(99,102,241,0.25)]",
              formFieldInput:
                "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] rounded-[var(--radius-sm)]",
              footerActionLink: "text-[var(--accent)]",
              dividerLine: "bg-[var(--border-subtle)]",
              dividerText: "text-[var(--text-tertiary)]",
            },
          }}
        />
      </div>
    </div>
  );
}
