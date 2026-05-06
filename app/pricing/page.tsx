import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Pricing from "@/components/landing/Pricing";

export const metadata = {
  title: "Precios",
  description: "Planes simples y predecibles para cada negocio.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#060608]">
      <Navbar />
      <div className="pt-24">
        <Pricing />
      </div>
    </main>
  );
}
