-- Performance indexes: added based on query analysis
-- Conversation table
CREATE INDEX IF NOT EXISTS "Conversation_siteId_idx" ON "Conversation"("siteId");
CREATE INDEX IF NOT EXISTS "Conversation_siteId_createdAt_idx" ON "Conversation"("siteId", "createdAt");
CREATE INDEX IF NOT EXISTS "Conversation_siteId_visitorId_idx" ON "Conversation"("siteId", "visitorId");
CREATE INDEX IF NOT EXISTS "Conversation_siteId_intentLabel_idx" ON "Conversation"("siteId", "intentLabel");

-- VisitorProfile table
CREATE INDEX IF NOT EXISTS "VisitorProfile_siteId_idx" ON "VisitorProfile"("siteId");
CREATE INDEX IF NOT EXISTS "VisitorProfile_siteId_maxIntentLabel_idx" ON "VisitorProfile"("siteId", "maxIntentLabel");
CREATE INDEX IF NOT EXISTS "VisitorProfile_siteId_lastSeenAt_idx" ON "VisitorProfile"("siteId", "lastSeenAt");

-- Message table
CREATE INDEX IF NOT EXISTS "Message_conversationId_idx" ON "Message"("conversationId");
