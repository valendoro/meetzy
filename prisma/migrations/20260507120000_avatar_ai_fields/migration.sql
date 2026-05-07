-- AlterTable
ALTER TABLE "Site" ADD COLUMN "avatarStyle" TEXT;
ALTER TABLE "Site" ADD COLUMN "avatarPrompt" TEXT;
ALTER TABLE "Site" ADD COLUMN "avatarLastGenerated" TIMESTAMP(3);
