-- AlterTable
ALTER TABLE "donor_screenings" ADD COLUMN     "organizationId" UUID;

-- CreateIndex
CREATE INDEX "donor_screenings_organizationId_idx" ON "donor_screenings"("organizationId");

-- AddForeignKey
ALTER TABLE "donor_screenings" ADD CONSTRAINT "donor_screenings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
