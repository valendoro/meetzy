import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Problem from "@/components/landing/Problem";
import Features from "@/components/landing/Features";
import UseCases from "@/components/landing/UseCases";
import AvatarShowcase from "@/components/landing/AvatarShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import LandingOrchestrator from "@/components/landing/LandingOrchestrator";
import WidgetDemo from "@/components/landing/WidgetDemo";
import Testimonials from "@/components/landing/Testimonials";
import TrustStrip from "@/components/landing/TrustStrip";
import { Stats, MidFunnelCTA } from "@/components/landing/LandingStats";

export const metadata: Metadata = {
  title: "Meetzy — Tu web observa, entiende y responde",
  description:
    "Meetzy le da a tu web la capacidad de entender a cada visitante y responder con contexto real. Behavioral tracking + agente IA. Setup en 10 minutos.",
  openGraph: {
    title: "Meetzy — Tu web observa, entiende y responde",
    description: "El primer agente de IA que conoce a tu visitante antes de que hable.",
    url: "https://meetzy.ai",
    siteName: "Meetzy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meetzy — Tu web observa, entiende y responde",
    description: "El primer agente de IA que conoce a tu visitante antes de que hable.",
  },
};

export default function HomePage() {
  return (
    <main className="relative z-[1] min-h-screen w-full">
      <Navbar />
      <LandingOrchestrator />
      <WidgetDemo />
      <Stats />
      <Problem />
      <Testimonials />
      <TrustStrip />
      <Features />
      <UseCases />
      <AvatarShowcase />
      <HowItWorks />
      <MidFunnelCTA />
      <Pricing />
    </main>
  );
}
