import { getDbUser } from "@/lib/auth";
import OnboardingExperience from "@/components/onboarding/OnboardingExperience";
import { redirect } from "next/navigation";

export const metadata = { title: "Crear agente — Meetzy" };

export default async function NewSitePage() {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");
  return <OnboardingExperience userPlan={dbUser.plan} />;
}
