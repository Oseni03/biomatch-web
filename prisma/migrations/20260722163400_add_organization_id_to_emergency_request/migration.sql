-- AlterTable
ALTER TABLE "emergency_requests" ADD COLUMN     "organizationId" UUID;

-- CreateIndex
CREATE INDEX "emergency_requests_organizationId_idx" ON "emergency_requests"("organizationId");

-- AddForeignKey
ALTER TABLE "emergency_requests" ADD CONSTRAINT "emergency_requests_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
