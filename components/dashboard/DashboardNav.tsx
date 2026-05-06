"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

export default function DashboardNav() {
  const { user } = useUser();
  const displayName =
    user?.fullName || user?.primaryEmailAddress?.emailAddress || user?.username || "Usuario";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40,
      backgroundColor: "rgba(7,7,10,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto", padding: "0 24px",
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/dashboard" style={{
          fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.2rem",
          letterSpacing: "-0.02em", color: "#eceae5", textDecoration: "none",
        }}>
          MEET<span style={{ color: "#6366f1" }}>ZY</span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 24, fontSize: "0.875rem" }}>
          {[
            ["Mis sitios", "/dashboard"],
            ["Nuevo agente", "/dashboard/new"],
            ["Planes", "/pricing"],
          ].map(([label, href]) => (
            <Link key={label} href={href} style={{
              color: "rgba(236,234,229,0.45)", textDecoration: "none", transition: "color 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#eceae5"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(236,234,229,0.45)"}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/new" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#6366f1", color: "#fff", textDecoration: "none",
            fontWeight: 600, fontSize: "0.8rem", padding: "8px 14px",
            borderRadius: 12, transition: "background 0.15s",
          }}>
            + Nuevo
          </Link>
          <span style={{ fontSize: "0.8rem", color: "rgba(236,234,229,0.4)" }}>
            {displayName.split(" ")[0]}
          </span>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
