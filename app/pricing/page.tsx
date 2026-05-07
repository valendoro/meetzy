"use client";

import Link from "next/link";
import Pricing from "@/components/landing/Pricing";
import { SignInButton } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <div className="meetzy-product-ui min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-syne text-lg font-extrabold tracking-[-0.03em] text-[var(--text-primary)]">
            MEET<span className="text-[var(--accent)]">ZY</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="inline-flex min-h-10 items-center text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
              Inicio
            </Link>
            <Link href="/dashboard" className="inline-flex min-h-10 items-center text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
              Dashboard
            </Link>
            <SignInButton mode="modal">
              <button
                type="button"
                className="inline-flex min-h-10 items-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2 font-medium text-white shadow-[0_0_16px_rgba(99,102,241,0.25)] transition hover:bg-[var(--accent-hover)]"
              >
                Entrar
              </button>
            </SignInButton>
          </div>
        </div>
      </header>
      <div className="bg-[var(--bg-base)] pb-24 pt-12">
        <Pricing />
      </div>
    </div>
  );
}
