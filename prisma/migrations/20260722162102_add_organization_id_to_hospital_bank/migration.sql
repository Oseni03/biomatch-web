-- AlterTable
ALTER TABLE "hospital_banks" ADD COLUMN     "organizationId" UUID;

-- CreateIndex
CREATE INDEX "hospital_banks_organizationId_idx" ON "hospital_banks"("organizationId");

-- AddForeignKey
ALTER TABLE "hospital_banks" ADD CONSTRAINT "hospital_banks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
