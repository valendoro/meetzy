import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import AvatarConfigurator from "@/components/dashboard/AvatarConfigurator";
import SiteSubnav from "@/components/dashboard/SiteSubnav";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Avatar" };

export default async function AvatarPage({ params }: { params: Promise<{ siteId: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const { siteId } = await params;
  const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
  if (!site) notFound();

  const isPro = dbUser.plan === "pro" || dbUser.plan === "elite";

  return (
    <div>
      <SiteSubnav siteId={siteId} siteName={site.name} active="avatar" pageTitle="Avatar" />

      {!isPro ? (
        <div className="dash-panel mx-auto max-w-lg rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-10 text-center shadow-[var(--shadow-sm)]">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)]">
            <Lock className="size-7 text-[var(--accent)]" aria-hidden />
          </div>
          <h3 className="font-syne text-lg font-bold tracking-tight text-[var(--text-primary)]">Avatar de marca en Plan Pro</h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            Personajes 2D animados con tus colores y logo están incluidos en <strong className="text-[var(--text-primary)]">Pro</strong> y{" "}
            <strong className="text-[var(--text-primary)]">Elite</strong>. En Starter el widget sigue funcionando con burbuja y texto.
          </p>
          <Button asChild className="mt-8 gap-2">
            <Link href="/pricing">
              <Sparkles className="size-4" />
              Ver planes
            </Link>
          </Button>
        </div>
      ) : (
        <AvatarConfigurator site={site} />
      )}
    </div>
  );
}
