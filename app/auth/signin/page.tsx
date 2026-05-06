import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070a]">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(99,102,241,0.08) 0%, transparent 70%)"
      }} />
      <div className="relative">
        <div className="text-center mb-8">
          <p className="font-syne font-black text-2xl text-[#eceae5]">
            MEET<span className="text-accent">ZY</span>
          </p>
          <p className="text-sm mt-1" style={{ color: "rgba(236,234,229,0.4)" }}>Entrá a tu cuenta</p>
        </div>
        <SignIn redirectUrl="/dashboard" signUpUrl="/sign-up" />
      </div>
    </div>
  );
}
