-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('standard', 'critical');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'matched', 'expired', 'cancelled', 'fulfilled');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('alerted', 'opened', 'accepted', 'declined', 'en_route', 'arrived', 'completed');

-- CreateTable
CREATE TABLE "emergency_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hospitalId" UUID NOT NULL,
    "bloodGroup" "BloodGroup" NOT NULL,
    "unitsNeeded" INTEGER NOT NULL,
    "urgencyLevel" "UrgencyLevel" NOT NULL DEFAULT 'standard',
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "searchRadius" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "emergency_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requestId" UUID NOT NULL,
    "donorId" UUID NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'alerted',
    "respondedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "emergency_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "emergency_requests_hospitalId_idx" ON "emergency_requests"("hospitalId");

-- CreateIndex
CREATE INDEX "emergency_requests_bloodGroup_idx" ON "emergency_requests"("bloodGroup");

-- CreateIndex
CREATE INDEX "emergency_requests_status_idx" ON "emergency_requests"("status");

-- CreateIndex
CREATE INDEX "emergency_requests_createdAt_idx" ON "emergency_requests"("createdAt");

-- CreateIndex
CREATE INDEX "emergency_alerts_requestId_idx" ON "emergency_alerts"("requestId");

-- CreateIndex
CREATE INDEX "emergency_alerts_donorId_idx" ON "emergency_alerts"("donorId");

-- CreateIndex
CREATE INDEX "emergency_alerts_status_idx" ON "emergency_alerts"("status");

-- AddForeignKey
ALTER TABLE "emergency_requests" ADD CONSTRAINT "emergency_requests_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_alerts" ADD CONSTRAINT "emergency_alerts_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "emergency_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_alerts" ADD CONSTRAINT "emergency_alerts_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
