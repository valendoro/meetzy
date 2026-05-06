import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OnboardingWizard from "@/components/dashboard/OnboardingWizard";

export const metadata = { title: "Nuevo agente" };

export default async function NewSitePage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-syne font-bold text-2xl text-[#F0EDE8]">
          Crear nuevo agente
        </h1>
        <p className="text-sm text-[#6b6b6b] mt-1">
          3 pasos y tu agente estará listo para instalar.
        </p>
      </div>
      <OnboardingWizard userPlan={user?.plan ?? "starter"} />
    </div>
  );
}
