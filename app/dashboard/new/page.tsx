import { getDbUser } from "@/lib/auth";
import OnboardingWizard from "@/components/dashboard/OnboardingWizard";
import { redirect } from "next/navigation";

export const metadata = { title: "Nuevo agente" };

export default async function NewSitePage() {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-syne font-bold text-2xl text-[#eceae5]">Crear nuevo agente</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(236,234,229,0.4)" }}>
          Configurá tu agente en minutos.
        </p>
      </div>
      <OnboardingWizard userPlan={dbUser.plan} />
    </div>
  );
}
