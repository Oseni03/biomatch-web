-- CreateEnum
CREATE TYPE "ScreeningStatus" AS ENUM ('pending', 'passed', 'failed');

-- CreateTable
CREATE TABLE "donor_screenings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "donorId" UUID NOT NULL,
    "hospitalId" UUID NOT NULL,
    "staffUserId" UUID NOT NULL,
    "status" "ScreeningStatus" NOT NULL DEFAULT 'pending',
    "screenedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMPTZ(6),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "donor_screenings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "donor_screenings_donorId_idx" ON "donor_screenings"("donorId");

-- CreateIndex
CREATE INDEX "donor_screenings_hospitalId_idx" ON "donor_screenings"("hospitalId");

-- CreateIndex
CREATE INDEX "donor_screenings_status_idx" ON "donor_screenings"("status");

-- CreateIndex
CREATE INDEX "donor_screenings_resolvedAt_idx" ON "donor_screenings"("resolvedAt");

-- AddForeignKey
ALTER TABLE "donor_screenings" ADD CONSTRAINT "donor_screenings_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donor_screenings" ADD CONSTRAINT "donor_screenings_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donor_screenings" ADD CONSTRAINT "donor_screenings_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Grandfather backfill: every pre-existing donor is backfilled as a synthetic
-- resolved "passed" screening so no currently-active donor drops out of
-- hospital matching the moment donor verification ships (contexts/issues/47).
INSERT INTO "donor_screenings" ("id", "donorId", "hospitalId", "staffUserId", "status", "screenedAt", "resolvedAt", "notes", "createdAt", "updatedAt")
SELECT gen_random_uuid(), "id", "id", "id", 'passed', now(), now(), 'Grandfathered: pre-existing donor backfilled as verified on donor-verification feature launch.', now(), now()
FROM "user"
WHERE "role" = 'donor';
