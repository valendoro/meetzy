import Link from "next/link";

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative text-center max-w-md">
        <Link href="/" className="font-syne font-bold text-2xl text-[#F0EDE8] inline-block mb-8">
          MEET<span className="text-accent">ZY</span>
        </Link>

        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-10">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="font-syne font-bold text-2xl text-[#F0EDE8] mb-3">
            Revisá tu email
          </h1>
          <p className="text-[#6b6b6b] leading-relaxed mb-6">
            Te enviamos un link de acceso. Hacé clic en el link para entrar a
            tu cuenta de Meetzy.
          </p>
          <p className="text-xs text-[#444]">
            El link expira en 24 horas. Si no lo ves, revisá tu carpeta de
            spam.
          </p>
        </div>

        <Link
          href="/auth/signin"
          className="inline-block mt-6 text-sm text-[#6b6b6b] hover:text-[#F0EDE8] transition-colors"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
