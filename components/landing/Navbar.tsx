"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Show, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      transition: "background-color 0.3s ease, border-color 0.3s ease",
      ...(scrolled ? {
        backgroundColor: "rgba(7,7,10,0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      } : {}),
    }}>
      <div className="wrap" style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em", color: "#eceae5", textDecoration: "none" }}>
          MEET<span style={{ color: "#6366f1" }}>ZY</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="nav-links">
          {[["Cómo funciona", "#como-funciona"], ["Para quién", "#para-quien"], ["Precios", "#precios"]].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: "0.875rem", color: "rgba(236,234,229,0.45)", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#eceae5"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(236,234,229,0.45)"}
            >{l}</a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button style={{ fontSize: "0.875rem", color: "rgba(236,234,229,0.5)", background: "none", border: "none", cursor: "pointer", padding: "6px 4px" }}>
                Iniciar sesión
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn-primary" style={{ padding: "8px 18px", fontSize: "0.8rem" }}>
                Crear mi agente
              </button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <Link href="/dashboard" className="btn-primary" style={{ padding: "8px 18px", fontSize: "0.8rem", textDecoration: "none" }}>
              Dashboard
            </Link>
            <UserButton appearance={{ baseTheme: dark }} afterSignOutUrl="/" />
          </Show>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .nav-links { display: none !important; } }
      `}</style>
    </nav>
  );
}
