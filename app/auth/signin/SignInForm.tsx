"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await signIn("resend", {
        email,
        callbackUrl,
        redirect: false,
      });
      if (res?.error) {
        setError("Error al enviar el email. Intentá de nuevo.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Error inesperado. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl });
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-syne font-bold text-2xl text-[#F0EDE8]">
            MEET<span className="text-accent">ZY</span>
          </Link>
          <p className="text-[#6b6b6b] text-sm mt-2">
            {sent ? "Revisá tu email" : "Entrá a tu cuenta"}
          </p>
        </div>

        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none">
                  <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="font-syne font-bold text-xl text-[#F0EDE8] mb-2">Email enviado</h3>
              <p className="text-[#6b6b6b] text-sm mb-1">Mandamos un link de acceso a</p>
              <p className="text-[#F0EDE8] font-medium text-sm mb-6">{email}</p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-accent hover:text-accent/80 transition-colors"
              >
                Usar otro email
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 border border-[#333] text-[#F0EDE8] font-medium py-3 rounded-xl hover:border-[#555] hover:bg-[#1a1a1a] transition-all mb-6"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuar con Google
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-[#1e1e1e]" />
                <span className="text-xs text-[#6b6b6b]">o con tu email</span>
                <div className="flex-1 h-px bg-[#1e1e1e]" />
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-[#6b6b6b] mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full bg-[#0e0e0e] border border-[#222] text-[#F0EDE8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-[#444]"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-white font-medium py-3 rounded-xl hover:bg-accent/90 disabled:opacity-50 transition-all"
                >
                  {loading ? "Enviando..." : "Enviar link de acceso"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-[#6b6b6b] mt-6">
          Al continuar aceptás nuestros{" "}
          <Link href="#" className="text-accent hover:underline">Términos</Link>{" "}
          y{" "}
          <Link href="#" className="text-accent hover:underline">Privacidad</Link>
        </p>
      </div>
    </div>
  );
}
