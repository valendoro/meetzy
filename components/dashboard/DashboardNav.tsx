"use client";

import Link from "next/link";
import { UserButton, Show } from "@clerk/nextjs";

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export default function DashboardNav({ user: _ }: Props) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40,
      backgroundColor: "rgba(7,7,10,0.88)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
    }}>
      <div className="wrap" style={{ maxWidth: "none", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/dashboard" style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em", color: "#eceae5", textDecoration: "none" }}>
          MEET<span style={{ color: "#6366f1" }}>ZY</span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 24, fontSize: "0.875rem" }} className="dash-links">
          {[["Mis sitios", "/dashboard"], ["Nuevo agente", "/dashboard/new"], ["Planes", "/pricing"]].map(([l, h]) => (
            <Link key={l} href={h} style={{ color: "rgba(236,234,229,0.45)", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#eceae5"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(236,234,229,0.45)"}
            >{l}</Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/new" className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.8rem", textDecoration: "none" }} className="hidden-mobile">
            + Nuevo
          </Link>
          <Show when="signed-in">
            <UserButton afterSignOutUrl="/" />
          </Show>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .dash-links { display: none !important; } .hidden-mobile { display: none !important; } }
      `}</style>
    </header>
  );
}
