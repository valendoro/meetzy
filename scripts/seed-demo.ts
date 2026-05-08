/**
 * Demo seed — genera datos ficticios para el agente "clasicar"
 * Uso: npx tsx scripts/seed-demo.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

const SITE_PUBLIC_ID = "cmoxddfz5000130qs0yr8au2i";

// ── helpers ──────────────────────────────────────────────────────────────────
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}
function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400000);
}
function cuid() {
  return (
    "c" +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  );
}

// ── data pools ───────────────────────────────────────────────────────────────
const INTENTS = [
  { label: "exploring",    score: () => rand(5,  30) },
  { label: "interested",   score: () => rand(31, 52) },
  { label: "evaluating",   score: () => rand(53, 68) },
  { label: "ready_to_buy", score: () => rand(69, 84) },
  { label: "hot_lead",     score: () => rand(85, 99) },
];
// weighted distribution: more exploring/interested, fewer hot
const INTENT_WEIGHTS = [35, 28, 18, 12, 7];

function pickIntent() {
  const total = INTENT_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < INTENTS.length; i++) {
    r -= INTENT_WEIGHTS[i]!;
    if (r <= 0) return INTENTS[i]!;
  }
  return INTENTS[0]!;
}

const SOURCES = ["google", "google", "google", "direct", "direct", "instagram", "facebook", "referral"];
const COUNTRIES = ["AR", "AR", "AR", "MX", "CL", "US", "ES", "CO"];
const PAGES = [
  "/",
  "/autos",
  "/autos/usados",
  "/autos/nuevos",
  "/concesionarias",
  "/financiacion",
  "/contacto",
  "/blog",
];

const NAMES = [
  "Martín García", "Lucía Fernández", "Pablo Rodríguez", "Ana Martínez",
  "Diego López", "Sofía González", "Andrés Pérez", "Carolina Sánchez",
  "Tomás Álvarez", "Valentina Torres", "Matías Romero", "Camila Díaz",
  "Facundo Reyes", "Natalia Moreno", "Ignacio Herrera", "Florencia Castro",
  "Sebastián Ruiz", "Jimena Vargas", "Leandro Muñoz", "Agustina Medina",
];
const COMPANIES = [
  null, null, null, null, // most visitors have no company
  "Toyota AR", "Ford Argentina", "Grupo Assa", "Autos Palermo", "Retiro Motors",
];

const CONVERSATIONS: Array<{user: string; bot: string}[]> = [
  [
    { user: "Hola, quería saber si tienen autos usados disponibles", bot: "¡Hola! Sí, tenemos una gran variedad de autos usados. ¿Tenés algún modelo o presupuesto en mente?" },
    { user: "Busco algo familiar, hasta 15 mil dólares", bot: "Perfecto. Para ese presupuesto te recomendaría mirar Toyota Corolla, VW Vento o Chevrolet Cruze. ¿Querés que te filtre por año también?" },
    { user: "Sí, del 2020 para arriba", bot: "Entendido. Encontré 8 opciones disponibles del 2020+ dentro de ese rango. ¿Te paso el link o preferís que te contacte un asesor?" },
  ],
  [
    { user: "¿Puedo financiar un auto sin recibo de sueldo?", bot: "En algunos casos sí. Trabajamos con financieras que aceptan ingresos informales o monotributistas. ¿Cuál es tu situación?" },
    { user: "Soy monotributista categoría C", bot: "Perfecto, eso aplica. La mayoría de los planes requieren entre 3 y 6 meses de antigüedad en el monotributo. ¿Sabés qué modelo estás buscando?" },
  ],
  [
    { user: "busco una pickup, cuántos tienen?", bot: "Tenemos varias pickups disponibles. ¿Preferís cabina simple, doble o extra? ¿Tenés marca preferida?" },
    { user: "doble cabina, Ford o Toyota", bot: "Tenemos 4 Ford Ranger y 2 Toyota Hilux disponibles ahora. Precio desde $18.000. ¿Querés ver fotos y km de alguna?" },
    { user: "sí del ranger 2021", bot: "Hay una Ranger XLT 2021 con 42.000 km a $21.500. ¿Te paso contacto del vendedor?" },
    { user: "dale, y tiene garantía?", bot: "Sí, viene con garantía mecánica de 6 meses incluida. ¿Te dejo el WhatsApp del asesor?" },
  ],
  [
    { user: "qué tal, cómo funciona esto?", bot: "¡Hola! Soy el asistente de Clasicar. Podés preguntarme sobre autos disponibles, precios, financiación y más. ¿En qué te ayudo?" },
    { user: "ok gracias, estaba curioseando", bot: "¡Cuando quieras! Si en algún momento buscás un auto, acá estoy." },
  ],
  [
    { user: "necesito hacer una tasación de mi auto", bot: "Podemos ayudarte. ¿Qué modelo, año y kilómetros tiene tu auto?" },
    { user: "Peugeot 208 2019, 68000 km", bot: "Un 208 2019 en buen estado con esos kilómetros puede estar valuado entre $8.500 y $10.000 dependiendo el estado y versión. ¿Es Active, Allure o GT?" },
    { user: "Allure", bot: "Perfecto. El 208 Allure 2019 tiene buen valor de reventa. ¿Querés coordinar una revisión presencial o preferís la tasación online?" },
    { user: "online mejor", bot: "Genial. Completá el formulario de tasación en línea y en 24hs te contactamos con la oferta. ¿Te paso el link?" },
  ],
  [
    { user: "Tienen descuentos por pago contado?", bot: "Sí, en muchos vehículos el pago contado tiene descuento de entre 5% y 10% según el modelo. ¿Tenés alguno en mente?" },
    { user: "Un Cronos 2022", bot: "El Fiat Cronos 2022 Drive 1.3 está a $13.200. Al contado podría quedar en $12.400 aprox. ¿Cuándo lo podrías venir a ver?" },
    { user: "esta semana puedo el jueves", bot: "Perfecto, el jueves tenemos lugar. ¿A qué hora te quedaría mejor, mañana o tarde?" },
    { user: "a las 11 está?", bot: "Sí, las 11 está disponible. ¿Te confirmo la cita con nombre y teléfono?" },
    { user: "Sí, soy Lucas Pereyra, 11 3344 5566", bot: "¡Listo Lucas! Cita confirmada para el jueves a las 11. Te esperamos en nuestra sucursal de Palermo." },
  ],
  [
    { user: "cuánto sale el seguro para un auto de 10k?", bot: "Depende la compañía y el modelo, pero para un auto de $10.000 USD el seguro contra terceros puede rondar $18.000-$25.000 ARS/mes. ¿Querés que te consiga una cotización?" },
  ],
  [
    { user: "Hola tengo una pregunta sobre transferencia", bot: "¡Hola! Con gusto te ayudo. ¿Qué necesitás saber sobre la transferencia?" },
    { user: "cuánto tarda el trámite y cuánto sale?", bot: "El trámite de transferencia tarda entre 5 y 15 días hábiles. El costo varía según la provincia, pero en CABA ronda los $80.000-$120.000 ARS. ¿Estás comprando o vendiendo?" },
    { user: "comprando, el vendedor me dice que lo hago yo", bot: "Es correcto, en general el comprador es quien inicia el trámite. Vas a necesitar: formulario 08, DNI, y la firma del vendedor certificada. ¿Querés que te explique el paso a paso?" },
  ],
];

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Get internal site ID
  const site = await prisma.site.findUnique({
    where: { siteId: SITE_PUBLIC_ID },
    select: { id: true },
  });
  if (!site) {
    throw new Error(`Site ${SITE_PUBLIC_ID} not found`);
  }
  const internalSiteId = site.id;
  console.log("Site internal ID:", internalSiteId);

  // 2. Generate 60 conversations spread over last 30 days
  const COUNT = 60;
  let created = 0;

  for (let i = 0; i < COUNT; i++) {
    const intent = pickIntent();
    const score = intent.score();
    const source = pick(SOURCES);
    const country = pick(COUNTRIES);
    const daysBack = rand(0, 30);
    const hoursBack = rand(0, 23);
    const createdAt = new Date(daysAgo(daysBack).getTime() - hoursBack * 3600000);
    const sessionDuration = rand(30, 480);
    const pagesCount = rand(1, 5);
    const pages = Array.from({ length: pagesCount }, () => pick(PAGES));

    const hasEmail = Math.random() < 0.25;
    const hasName = Math.random() < 0.4;
    const nameEntry = hasName ? pick(NAMES) : null;
    const emailEntry = hasEmail
      ? `${(nameEntry ?? "visitante").toLowerCase().replace(/\s/g, ".").replace(/[áéíóú]/g, (c) => ({á:"a",é:"e",í:"i",ó:"o",ú:"u"})[c] ?? c)}${rand(1, 99)}@gmail.com`
      : null;
    const company = pick(COMPANIES);

    const visitorId = cuid();
    const convId = cuid();

    // pick a conversation script
    const script = pick(CONVERSATIONS);

    const conv = await prisma.conversation.create({
      data: {
        id: convId,
        siteId: internalSiteId,
        visitorId,
        visitorEmail: emailEntry,
        visitorName: nameEntry,
        visitorCompany: company,
        country,
        source,
        pagesVisited: pages,
        sessionDuration,
        intentScore: score,
        intentLabel: intent.label,
        demoBooked: intent.label === "hot_lead" && Math.random() < 0.3,
        createdAt,
        updatedAt: createdAt,
        messages: {
          create: script.flatMap((turn, idx) => {
            const base = new Date(createdAt.getTime() + idx * 30000);
            return [
              {
                id: cuid(),
                role: "user",
                content: turn.user,
                createdAt: base,
              },
              {
                id: cuid(),
                role: "assistant",
                content: turn.bot,
                createdAt: new Date(base.getTime() + 8000),
              },
            ];
          }),
        },
      },
    });

    // upsert visitor profile
    await prisma.visitorProfile.upsert({
      where: { visitorId_siteId: { visitorId, siteId: internalSiteId } },
      create: {
        visitorId,
        siteId: internalSiteId,
        email: emailEntry,
        name: nameEntry,
        company,
        totalVisits: 1,
        totalMessages: script.length * 2,
        totalTime: sessionDuration,
        maxIntentScore: score,
        maxIntentLabel: intent.label,
        demoBooked: false,
        firstSeenAt: createdAt,
        lastSeenAt: createdAt,
        country,
        topSource: source,
      },
      update: {},
    });

    created++;
    if (created % 10 === 0) console.log(`  ${created}/${COUNT} conversaciones creadas...`);
  }

  console.log(`\n✅ Seed completo: ${created} conversaciones creadas para "${SITE_PUBLIC_ID}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
