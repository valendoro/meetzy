"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

export default function DashboardNav() {
  const { user } = useUser();
  const displayName =
    user?.fullName || user?.primaryEmailAddress?.emailAddress || user?.username || "Usuario";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        backgroundColor: "rgba(11, 10, 15, 0.92)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        className="wrap"
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/dashboard" className="logo-mark">
          MEET<span>ZY</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-[0.875rem]" aria-label="Principal">
          {[
            ["Mis sitios", "/dashboard"],
            ["Nuevo agente", "/dashboard/new"],
            ["Planes", "/pricing"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              style={{
                color: "rgba(243, 241, 236, 0.58)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "rgba(243, 241, 236, 0.58)";
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/dashboard/new"
            className="btn-primary"
            style={{ textDecoration: "none", fontSize: "0.8rem", padding: "0.5rem 1rem" }}
          >
            + Nuevo
          </Link>
          <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>{displayName.split(" ")[0]}</span>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
