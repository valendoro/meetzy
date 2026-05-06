import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Features from "@/components/landing/Features";
import UseCases from "@/components/landing/UseCases";
import AvatarShowcase from "@/components/landing/AvatarShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import MiloDemo from "@/components/landing/MiloDemo";
import LandingOrchestrator from "@/components/landing/LandingOrchestrator";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-[#060608]">
      <Navbar />
      {/*
        LandingOrchestrator inicializa el BehaviorTracker una vez
        y lo pasa a Hero y MiloDemo a través del contexto.
        El resto de secciones son Server Components estáticos.
      */}
      <LandingOrchestrator />
      <Stats />
      <Problem />
      <Features />
      <UseCases />
      <AvatarShowcase />
      <HowItWorks />
      <Pricing />
    </main>
  );
}

function Stats() {
  const STATS = [
    { value: "1.200+", label: "agentes activos" },
    { value: "4.8M", label: "conversaciones" },
    { value: "94%", label: "satisfacción" },
    { value: "10 min", label: "de setup" },
  ];
  return (
    <section className="py-16 border-y border-[rgba(255,255,255,0.05)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p
                className="font-syne font-black text-[#eeeae4] mb-1"
                style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "-0.03em" }}
              >
                {s.value}
              </p>
              <p className="text-sm text-[rgba(238,234,228,0.35)]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
