-- Asegura columnas avatar IA en producción (Railway) si migración previa falló o DB estaba desfasada.
-- IF NOT EXISTS evita error si ya existen (p. ej. tras db push manual).
ALTER TABLE "Site" ADD COLUMN IF NOT EXISTS "avatarStyle" TEXT;
ALTER TABLE "Site" ADD COLUMN IF NOT EXISTS "avatarPrompt" TEXT;
ALTER TABLE "Site" ADD COLUMN IF NOT EXISTS "avatarLastGenerated" TIMESTAMP(3);
