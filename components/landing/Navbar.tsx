"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`landing-nav ${scrolled ? "landing-nav-scrolled" : ""}`}>
      <div className="wrap landing-nav-inner">
        <Link href="/" className="logo-mark">
          MEET<span>ZY</span>
        </Link>

        <div className="landing-nav-links">
          {[
            ["Cómo funciona", "#como-funciona"],
            ["Para quién", "#para-quien"],
            ["Precios", "#precios"],
          ].map(([label, href]) => (
            <a key={href} href={href} className="landing-nav-link">
              {label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
          {isSignedIn ? (
            <>
              <Link href="/dashboard" className="btn-primary" style={{ fontSize: "0.8rem", padding: "0.5rem 1.15rem" }}>
                Dashboard
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button
                  type="button"
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    color: "var(--c-muted)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.5rem 0.75rem",
                  }}
                >
                  Iniciar sesión
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button type="button" className="btn-primary" style={{ fontSize: "0.8rem", padding: "0.5rem 1.15rem" }}>
                  Crear mi agente
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
