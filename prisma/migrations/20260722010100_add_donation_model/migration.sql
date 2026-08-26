-- CreateTable
CREATE TABLE "donations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "donorId" UUID NOT NULL,
    "hospitalBankId" UUID,
    "emergencyRequestId" UUID,
    "bloodGroup" "BloodGroup" NOT NULL,
    "donatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "donations_donorId_idx" ON "donations"("donorId");

-- CreateIndex
CREATE INDEX "donations_hospitalBankId_idx" ON "donations"("hospitalBankId");

-- CreateIndex
CREATE INDEX "donations_donatedAt_idx" ON "donations"("donatedAt");

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_hospitalBankId_fkey" FOREIGN KEY ("hospitalBankId") REFERENCES "hospital_banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_emergencyRequestId_fkey" FOREIGN KEY ("emergencyRequestId") REFERENCES "emergency_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
