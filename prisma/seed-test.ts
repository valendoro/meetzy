import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

const VET_SITE_SLUG = "test-site-vet";

async function main() {
  console.log("🧪 Seeding test data (TESTING_MODE dashboard)…");

  const testUser = await prisma.user.upsert({
    where: { id: "test-user-id" },
    update: { name: "Valentín Test", plan: "pro", email: "test@meetzy.ai" },
    create: {
      id: "test-user-id",
      email: "test@meetzy.ai",
      name: "Valentín Test",
      plan: "pro",
      emailVerified: new Date(),
    },
  });

  const vetSystem = `Sos Luna, la asistente de Veterinaria Sol del Norte. Ayudás a dueños con urgencias, turnos y consultas generales. Sé empática y clara.`;

  const site1 = await prisma.site.upsert({
    where: { siteId: VET_SITE_SLUG },
    update: {
      name: "Veterinaria Sol del Norte",
      url: "https://vetsoldelnorte.com.ar",
      agentName: "Luna",
      agentRole: "Recepcionista",
      brandColor: "#22C55E",
      plan: "pro",
      isActive: true,
      systemPrompt: vetSystem,
      welcomeMessage: "¡Hola! Soy Luna. ¿Tu mascota necesita atención?",
    },
    create: {
      siteId: VET_SITE_SLUG,
      userId: testUser.id,
      name: "Veterinaria Sol del Norte",
      url: "https://vetsoldelnorte.com.ar",
      agentName: "Luna",
      agentRole: "Recepcionista",
      brandColor: "#22C55E",
      plan: "pro",
      isActive: true,
      systemPrompt: vetSystem,
      welcomeMessage: "¡Hola! Soy Luna. ¿Tu mascota necesita atención?",
    },
  });

  await prisma.site.upsert({
    where: { siteId: "test-site-ropa" },
    update: {},
    create: {
      siteId: "test-site-ropa",
      userId: testUser.id,
      name: "SEKKA Store",
      url: "https://sekka.com.ar",
      agentName: "Max",
      agentRole: "Vendedor",
      brandColor: "#FF4D00",
      plan: "starter",
      isActive: true,
      systemPrompt: "Sos Max, el asistente de SEKKA. Ayudás a elegir productos y talles.",
      welcomeMessage: "¡Hola! Soy Max de SEKKA. ¿Te ayudo a encontrar algo?",
    },
  });

  await prisma.site.upsert({
    where: { siteId: "test-site-consultora" },
    update: {},
    create: {
      siteId: "test-site-consultora",
      userId: testUser.id,
      name: "Dorvia Consulting",
      url: "https://dorvia.com.ar",
      agentName: "Aria",
      agentRole: "Guía",
      brandColor: "#6366f1",
      plan: "elite",
      isActive: false,
      systemPrompt: "Sos Aria de Dorvia Consulting.",
      welcomeMessage: "¡Hola! Soy Aria de Dorvia.",
    },
  });

  await prisma.conversation.deleteMany({ where: { siteId: site1.id } });
  await prisma.visitorProfile.deleteMany({ where: { siteId: site1.id } });

  const visitors: {
    id: string;
    name: string | null;
    email: string | null;
    country: string;
    city: string;
    intent: number;
    source: string;
    intentLabel: string;
  }[] = [
    {
      id: "visitor-1",
      name: "María García",
      email: "maria@gmail.com",
      country: "AR",
      city: "Buenos Aires",
      intent: 85,
      source: "google",
      intentLabel: "hot_lead",
    },
    {
      id: "visitor-2",
      name: null,
      email: null,
      country: "AR",
      city: "Córdoba",
      intent: 45,
      source: "instagram",
      intentLabel: "evaluating",
    },
    {
      id: "visitor-3",
      name: "Carlos Ruiz",
      email: "carlos@empresa.com",
      country: "MX",
      city: "Ciudad de México",
      intent: 92,
      source: "direct",
      intentLabel: "hot_lead",
    },
    {
      id: "visitor-4",
      name: null,
      email: null,
      country: "AR",
      city: "Rosario",
      intent: 20,
      source: "google",
      intentLabel: "exploring",
    },
    {
      id: "visitor-5",
      name: "Ana López",
      email: "ana@gmail.com",
      country: "AR",
      city: "Mendoza",
      intent: 67,
      source: "facebook",
      intentLabel: "ready_to_buy",
    },
  ];

  for (const visitor of visitors) {
    await prisma.visitorProfile.create({
      data: {
        visitorId: visitor.id,
        siteId: site1.id,
        email: visitor.email,
        name: visitor.name,
        country: visitor.country,
        topSource: visitor.source,
        totalVisits: Math.floor(Math.random() * 4) + 1,
        totalMessages: 5,
        totalTime: Math.floor(Math.random() * 600) + 120,
        maxIntentScore: visitor.intent,
        maxIntentLabel: visitor.intentLabel,
      },
    });

    const conv = await prisma.conversation.create({
      data: {
        siteId: site1.id,
        visitorId: visitor.id,
        visitorEmail: visitor.email,
        visitorName: visitor.name,
        country: visitor.country,
        city: visitor.city,
        intentScore: visitor.intent,
        intentLabel: visitor.intentLabel,
        source: visitor.source,
        sessionDuration: Math.floor(Math.random() * 600) + 60,
        device: Math.random() > 0.5 ? "mobile" : "desktop",
        pagesVisited: ["/", "/servicios", "/turnos"],
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.message.createMany({
      data: [
        {
          conversationId: conv.id,
          role: "assistant",
          content: "¡Hola! Soy Luna. ¿Tu mascota necesita atención?",
        },
        {
          conversationId: conv.id,
          role: "user",
          content: "Hola, mi gato está vomitando desde anoche",
        },
        {
          conversationId: conv.id,
          role: "assistant",
          content: "Entiendo, debe ser preocupante. ¿Cuántas veces vomitó aproximadamente? ¿Comió algo diferente?",
        },
        {
          conversationId: conv.id,
          role: "user",
          content: "Unas 4 veces. No comió nada raro que yo sepa",
        },
        {
          conversationId: conv.id,
          role: "assistant",
          content:
            "Con esa frecuencia es mejor que lo vea un veterinario hoy. Tenemos turnos disponibles esta tarde. ¿Te agendo uno?",
        },
      ],
    });
  }

  console.log(`✓ Test user: ${testUser.email} (${testUser.id})`);
  console.log(`✓ Rich demo site: /dashboard/${VET_SITE_SLUG}`);
  console.log("  Set TESTING_MODE=true in .env.local to browse without Clerk.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
