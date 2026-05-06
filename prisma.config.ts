import "dotenv/config";
import { defineConfig } from "prisma/config";

// DATABASE_URL may not be available at build time (e.g. during `prisma generate`)
// Use a placeholder so the generate step doesn't fail
const datasourceUrl = process.env["DATABASE_URL"] ?? "postgresql://placeholder:placeholder@localhost:5432/meetzy";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: datasourceUrl,
  },
});
