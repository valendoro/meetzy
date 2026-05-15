"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

const NAV_LINKS = [
  ["Cómo funciona", "#como-funciona"],
  ["Para quién", "#para-quien"],
  ["Precios", "#precios"],
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close drawer when viewport grows past mobile breakpoint
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 900) setMenuOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <nav className={`landing-nav ${scrolled || menuOpen ? "landing-nav-scrolled" : ""}`}>
        <div className="wrap landing-nav-inner">
          <Link href="/" className="logo-mark" onClick={() => setMenuOpen(false)}>
            MEET<span>ZY</span>
          </Link>

          {/* Desktop center links */}
          <div className="landing-nav-links">
            {NAV_LINKS.map(([label, href]) => (
              <a key={href} href={href} className="landing-nav-link">{label}</a>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>

            {/* Desktop-only auth */}
            <div className="landing-nav-auth">
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

            {/* Mobile-only: compact CTA (below 640px hides auth row, show just this) */}
            <div className="landing-nav-mobile-cta">
              {!isSignedIn && (
                <SignUpButton mode="modal">
                  <button type="button" className="btn-primary" style={{ fontSize: "0.78rem", padding: "0.45rem 0.9rem" }}>
                    Empezar
                  </button>
                </SignUpButton>
              )}
              {isSignedIn && (
                <Link href="/dashboard" className="btn-primary" style={{ fontSize: "0.78rem", padding: "0.45rem 0.9rem" }}>
                  Dashboard
                </Link>
              )}
            </div>

            {/* Hamburger */}
            <button
              className="landing-hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
            >
              <span className={`landing-hamburger-bar${menuOpen ? " landing-hamburger-bar--open-1" : ""}`} />
              <span className={`landing-hamburger-bar${menuOpen ? " landing-hamburger-bar--open-2" : ""}`} />
              <span className={`landing-hamburger-bar${menuOpen ? " landing-hamburger-bar--open-3" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="landing-mobile-menu" onClick={() => setMenuOpen(false)}>
          <div className="landing-mobile-menu-inner" onClick={e => e.stopPropagation()}>
            {NAV_LINKS.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="landing-mobile-link"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <div className="landing-mobile-auth">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="btn-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  Ir al Dashboard
                </Link>
              ) : (
                <>
                  <SignUpButton mode="modal">
                    <button type="button" className="btn-primary" onClick={() => setMenuOpen(false)}>
                      Crear mi agente gratis
                    </button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <button type="button" className="landing-mobile-signin" onClick={() => setMenuOpen(false)}>
                      Ya tengo cuenta — Iniciar sesión
                    </button>
                  </SignInButton>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .landing-nav-mobile-cta {
          display: flex;
        }
        @media (min-width: 640px) {
          .landing-nav-mobile-cta { display: none; }
        }
      `}</style>
    </>
  );
}
