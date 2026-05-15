import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { Shield, Users, Globe, MessageSquare, LayoutDashboard, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/sites", label: "Sitios", icon: Globe },
  { href: "/admin/conversations", label: "Conversaciones", icon: MessageSquare },
];

export const metadata = { title: "Admin — Meetzy" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-surface)" }}>
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-base)]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--border-subtle)]">
          <div className="flex size-7 items-center justify-center rounded-lg bg-red-500/15">
            <Shield className="size-4 text-red-400" />
          </div>
          <span className="font-syne text-[13px] font-bold text-red-400 tracking-wide">ADMIN</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            >
              <Icon className="size-3.5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-[var(--border-subtle)]">
          <p className="text-[10px] text-[var(--text-tertiary)] mb-2 truncate">{admin.email}</p>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <LogOut className="size-3" />
            Volver al dashboard
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
