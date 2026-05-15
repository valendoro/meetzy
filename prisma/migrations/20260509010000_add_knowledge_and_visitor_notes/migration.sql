-- CreateTable KnowledgeEntry
CREATE TABLE IF NOT EXISTS "KnowledgeEntry" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KnowledgeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable VisitorNote
CREATE TABLE IF NOT EXISTS "VisitorNote" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VisitorNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "KnowledgeEntry_siteId_idx" ON "KnowledgeEntry"("siteId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VisitorNote_profileId_idx" ON "VisitorNote"("profileId");

-- AddForeignKey
ALTER TABLE "KnowledgeEntry" DROP CONSTRAINT IF EXISTS "KnowledgeEntry_siteId_fkey";
ALTER TABLE "KnowledgeEntry" ADD CONSTRAINT "KnowledgeEntry_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorNote" DROP CONSTRAINT IF EXISTS "VisitorNote_profileId_fkey";
ALTER TABLE "VisitorNote" ADD CONSTRAINT "VisitorNote_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "VisitorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
