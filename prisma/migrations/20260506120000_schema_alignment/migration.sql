-- Align DB with current Prisma schema (Site / Conversation / VisitorProfile).
-- Fixes dashboard load failures when the DB only had the initial migration applied.

-- Site: columns added after init migration
ALTER TABLE "Site" ADD COLUMN IF NOT EXISTS "avatarImageUrl" TEXT;
ALTER TABLE "Site" ADD COLUMN IF NOT EXISTS "avatarGenerations" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Site" ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Site" ADD COLUMN IF NOT EXISTS "onboardingStep" INTEGER NOT NULL DEFAULT 1;

-- Conversation: new analytics / visitor fields
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "visitorEmail" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "visitorName" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "visitorCompany" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "referrer" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "searchQuery" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "utmSource" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "utmMedium" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "utmCampaign" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "pagesVisited" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "sessionDuration" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "activeTime" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "scrollDepth" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "sectionsViewed" JSONB;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "intentLabel" TEXT NOT NULL DEFAULT 'exploring';
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "demoBooked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "intentSignalsLog" JSONB;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "device" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "browser" TEXT;

-- Migrate bookedMeeting -> demoBooked (init migration only)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Conversation' AND column_name = 'bookedMeeting'
  ) THEN
    EXECUTE 'UPDATE "Conversation" SET "demoBooked" = COALESCE("bookedMeeting", false)';
  END IF;
END $$;

ALTER TABLE "Conversation" DROP COLUMN IF EXISTS "bookedMeeting";

-- intentScore: DOUBLE PRECISION -> INTEGER (matches Prisma schema)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Conversation' AND column_name = 'intentScore' AND udt_name = 'float8'
  ) THEN
    ALTER TABLE "Conversation" ALTER COLUMN "intentScore" DROP DEFAULT;
    ALTER TABLE "Conversation" ALTER COLUMN "intentScore" TYPE INTEGER USING (ROUND(COALESCE("intentScore", 0))::INTEGER);
    ALTER TABLE "Conversation" ALTER COLUMN "intentScore" SET DEFAULT 0;
  END IF;
END $$;

-- Match schema: cascade delete Conversation when Site is removed
ALTER TABLE "Conversation" DROP CONSTRAINT IF EXISTS "Conversation_siteId_fkey";
ALTER TABLE "Conversation"
  ADD CONSTRAINT "Conversation_siteId_fkey"
  FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- VisitorProfile (missing from init migration)
CREATE TABLE IF NOT EXISTS "VisitorProfile" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "company" TEXT,
    "totalVisits" INTEGER NOT NULL DEFAULT 1,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "totalTime" INTEGER NOT NULL DEFAULT 0,
    "maxIntentScore" INTEGER NOT NULL DEFAULT 0,
    "maxIntentLabel" TEXT NOT NULL DEFAULT 'exploring',
    "demoBooked" BOOLEAN NOT NULL DEFAULT false,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "country" TEXT,
    "topSource" TEXT,
    "contactedAt" TIMESTAMP(3),

    CONSTRAINT "VisitorProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VisitorProfile_visitorId_siteId_key" ON "VisitorProfile"("visitorId", "siteId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'VisitorProfile_siteId_fkey'
  ) THEN
    ALTER TABLE "VisitorProfile"
      ADD CONSTRAINT "VisitorProfile_siteId_fkey"
      FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
