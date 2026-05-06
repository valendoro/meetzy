import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#07070a" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />
      <div style={{ position: "relative", textAlign: "center" }}>
        <a href="/" style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em", color: "#eceae5", textDecoration: "none", display: "block", marginBottom: 32 }}>
          MEET<span style={{ color: "#6366f1" }}>ZY</span>
        </a>
        <SignUp />
      </div>
    </div>
  );
}
