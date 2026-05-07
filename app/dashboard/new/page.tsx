import { getDbUser } from "@/lib/auth";
import OnboardingExperience from "@/components/onboarding/OnboardingExperience";

export const metadata = { title: "Crear agente — Meetzy" };

export default async function NewSitePage() {
  const dbUser = await getDbUser();
  return <OnboardingExperience userPlan={dbUser?.plan ?? "starter"} isGuest={!dbUser} />;
}
