import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#1e1e1e] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <Link href="/" className="font-syne font-bold text-lg text-[#F0EDE8]">
              MEET<span className="text-accent">ZY</span>
            </Link>
            <p className="text-xs text-[#6b6b6b] mt-1">Tu web. Tu agente. Tu marca.</p>
          </div>

          <div className="flex items-center gap-6 text-sm text-[#6b6b6b]">
            <Link href="/pricing" className="hover:text-[#F0EDE8] transition-colors">Precios</Link>
            <Link href="/auth/signin" className="hover:text-[#F0EDE8] transition-colors">Acceder</Link>
            <Link href="/dashboard/new" className="hover:text-[#F0EDE8] transition-colors">Empezar</Link>
          </div>

          <p className="text-xs text-[#6b6b6b]">
            © {new Date().getFullYear()} Meetzy. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
