import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const metadata = { title: "Conversaciones" };

export default async function ConversationsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const { siteId } = await params;
  const site = await prisma.site.findFirst({ where: { siteId, userId: dbUser.id } });
  if (!site) notFound();

  const conversations = await prisma.conversation.findMany({
    where: { siteId: site.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: { role: true, content: true, createdAt: true },
      },
    },
  });

  const tabs = [
    { label: "Resumen", href: `/dashboard/${siteId}`, active: false },
    { label: "Conversaciones", href: `/dashboard/${siteId}/conversations`, active: true },
    { label: "Avatar", href: `/dashboard/${siteId}/avatar`, active: false },
    { label: "Configuración", href: `/dashboard/${siteId}/settings`, active: false },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "rgba(236,234,229,0.4)" }}>
        <Link href="/dashboard">Mis sitios</Link>
        <span>/</span>
        <Link href={`/dashboard/${siteId}`}>{site.name}</Link>
        <span>/</span>
        <span className="text-[#eceae5]">Conversaciones</span>
      </div>

      <div className="flex gap-1 border-b mb-8" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        {tabs.map(tab => (
          <Link key={tab.label} href={tab.href}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab.active ? "border-accent text-[#eceae5]" : "border-transparent hover:text-[#eceae5]"
            }`}
            style={{ color: tab.active ? undefined : "rgba(236,234,229,0.4)" }}>
            {tab.label}
          </Link>
        ))}
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">💬</p>
          <h3 className="font-syne font-bold text-lg text-[#eceae5] mb-2">Sin conversaciones aún</h3>
          <p className="text-sm" style={{ color: "rgba(236,234,229,0.4)" }}>
            Las conversaciones aparecerán acá cuando los visitantes usen el widget.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map(conv => (
            <details key={conv.id} className="rounded-2xl overflow-hidden group" style={{ background: "#0e0e12", border: "1px solid rgba(255,255,255,0.07)" }}>
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#111118] transition-colors list-none">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: "#1a1a22" }}>💬</div>
                  <div>
                    <p className="text-sm font-medium text-[#eceae5]">Visitante {conv.visitorId.slice(-6)}</p>
                    <p className="text-xs" style={{ color: "rgba(236,234,229,0.4)" }}>
                      {format(conv.createdAt, "d MMM yyyy, HH:mm", { locale: es })} · {conv.messages.length} mensajes
                    </p>
                  </div>
                </div>
                <svg className="w-4 h-4 transition-transform group-open:rotate-180" style={{ color: "rgba(236,234,229,0.4)" }} viewBox="0 0 24 24" fill="none">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>

              <div className="border-t p-5 space-y-3" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#09090d" }}>
                {conv.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.role === "user" ? "bg-accent text-white rounded-tr-sm" : "text-[#eceae5] rounded-tl-sm"
                    }`} style={msg.role !== "user" ? { background: "#1a1a22", border: "1px solid rgba(255,255,255,0.06)" } : {}}>
                      <p className="leading-relaxed">{msg.content}</p>
                      <p className="text-[10px] opacity-40 mt-1">{format(msg.createdAt, "HH:mm")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
