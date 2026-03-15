-- AlterTable: add slug for tool detail URLs
ALTER TABLE "Tool" ADD COLUMN "slug" TEXT;
UPDATE "Tool" SET "slug" = "id" WHERE "slug" IS NULL;
ALTER TABLE "Tool" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Tool_slug_key" ON "Tool"("slug");
CREATE INDEX "Tool_slug_idx" ON "Tool"("slug");
