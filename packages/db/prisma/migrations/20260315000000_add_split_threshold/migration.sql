-- Add splitThreshold column to ai_configs
-- This was previously added via `prisma db push` without a migration

ALTER TABLE "ai_configs" ADD COLUMN IF NOT EXISTS "splitThreshold" INTEGER NOT NULL DEFAULT 25000;
