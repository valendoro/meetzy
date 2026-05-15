/**
 * Convierte un usuario en admin de la plataforma.
 * Uso: npx tsx scripts/set-admin.ts tu@email.com
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: npx tsx scripts/set-admin.ts tu@email.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`❌ Usuario no encontrado: ${email}`);
    process.exit(1);
  }

  await prisma.user.update({ where: { email }, data: { isAdmin: true } });
  console.log(`✅ ${email} ahora es admin de la plataforma.`);
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
