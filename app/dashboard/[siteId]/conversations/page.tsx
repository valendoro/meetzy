import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const metadata = { title: "Conversaciones" };

export default async function ConversationsPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { siteId } = await params;

  const site = await prisma.site.findFirst({
    where: { siteId, userId: session.user.id },
  });

  if (!site) notFound();

  const conversations = await prisma.conversation.findMany({
    where: { siteId: site.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: { role: true, content: true, createdAt: true, uiComponents: true },
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
      <div className="flex items-center gap-2 text-sm text-[#6b6b6b] mb-6">
        <Link href="/dashboard" className="hover:text-[#F0EDE8] transition-colors">Mis sitios</Link>
        <span>/</span>
        <Link href={`/dashboard/${siteId}`} className="hover:text-[#F0EDE8] transition-colors">{site.name}</Link>
        <span>/</span>
        <span className="text-[#F0EDE8]">Conversaciones</span>
      </div>

      <div className="flex gap-1 border-b border-[#1e1e1e] mb-8">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab.active
                ? "border-accent text-[#F0EDE8]"
                : "border-transparent text-[#6b6b6b] hover:text-[#F0EDE8]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">💬</p>
          <h3 className="font-syne font-bold text-lg text-[#F0EDE8] mb-2">Sin conversaciones aún</h3>
          <p className="text-[#6b6b6b] text-sm">Las conversaciones aparecerán aquí cuando los visitantes usen el widget.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv) => (
            <details
              key={conv.id}
              className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden group"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#1a1a1a] transition-colors list-none">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#222] flex items-center justify-center text-sm">
                    💬
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#F0EDE8]">
                      Visitante {conv.visitorId.slice(-6)}
                    </p>
                    <p className="text-xs text-[#6b6b6b]">
                      {format(conv.createdAt, "d MMM yyyy, HH:mm", { locale: es })} ·{" "}
                      {conv.messages.length} mensajes
                    </p>
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-[#6b6b6b] transition-transform group-open:rotate-180"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>

              <div className="border-t border-[#1a1a1a] p-5 space-y-3 bg-[#0e0e0e]">
                {conv.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.role === "user"
                          ? "bg-accent text-white rounded-tr-sm"
                          : "bg-[#1a1a1a] text-[#F0EDE8] rounded-tl-sm"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      <p className="text-[10px] opacity-50 mt-1">
                        {format(msg.createdAt, "HH:mm")}
                      </p>
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
