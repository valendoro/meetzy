"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-syne font-black text-xl tracking-tight text-[#F0EDE8] select-none"
        >
          MEET<span className="text-accent">ZY</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-[rgba(240,237,232,0.5)]">
          {[
            ["Cómo funciona", "#como-funciona"],
            ["Para quién", "#para-quien"],
            ["Precios", "#precios"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="hover:text-[#F0EDE8] transition-colors duration-150"
            >
              {label}
            </a>
          ))}
        </div>

        <Link
          href="/dashboard/new"
          className="bg-accent hover:bg-[#4f46e5] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors duration-150"
        >
          Crear mi agente
        </Link>
      </div>
    </nav>
  );
}
