"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

interface DashboardNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-40 glass border-b border-[#1e1e1e]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="font-syne font-bold text-xl text-[#F0EDE8]">
          MEET<span className="text-accent">ZY</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="text-[#6b6b6b] hover:text-[#F0EDE8] transition-colors">
            Mis sitios
          </Link>
          <Link href="/dashboard/new" className="text-[#6b6b6b] hover:text-[#F0EDE8] transition-colors">
            Nuevo agente
          </Link>
          <Link href="/pricing" className="text-[#6b6b6b] hover:text-[#F0EDE8] transition-colors">
            Planes
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/new"
            className="hidden md:inline-flex items-center gap-2 bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            Nuevo
          </Link>

          <div className="relative group">
            <button className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              {user.image ? (
                <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold font-syne">
                  {initials}
                </div>
              )}
              <span className="hidden md:block text-sm text-[#F0EDE8] max-w-[120px] truncate">
                {user.name ?? user.email}
              </span>
            </button>

            <div className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-[#222] rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl">
              <div className="px-4 py-3 border-b border-[#1e1e1e]">
                <p className="text-xs text-[#6b6b6b]">{user.email}</p>
              </div>
              <Link
                href="/pricing"
                className="block px-4 py-2.5 text-sm text-[#6b6b6b] hover:text-[#F0EDE8] hover:bg-[#1a1a1a] transition-colors"
              >
                Actualizar plan
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full text-left px-4 py-2.5 text-sm text-[#6b6b6b] hover:text-[#F0EDE8] hover:bg-[#1a1a1a] transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
