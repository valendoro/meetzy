import { getDbUser } from "@/lib/auth";
import CreateAgentWizard from "@/components/dashboard/create-agent/CreateAgentWizard";

export const metadata = { title: "Crear agente — Meetzy" };

export default async function NewSitePage() {
  const dbUser = await getDbUser();
  return <CreateAgentWizard variant="page" userPlan={dbUser?.plan ?? "starter"} isGuest={!dbUser} />;
}
