/*
  Warnings:

  - You are about to drop the column `hospitalId` on the `donor_screenings` table. All the data in the column will be lost.
  - You are about to drop the column `hospitalId` on the `emergency_requests` table. All the data in the column will be lost.
  - You are about to drop the column `managedById` on the `hospital_banks` table. All the data in the column will be lost.
  - You are about to drop the column `hospitalStaffRole` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[requestId,donorId]` on the table `emergency_alerts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AlertStatus" ADD VALUE 'withdrawn';
ALTER TYPE "AlertStatus" ADD VALUE 'screening_failed';

-- DropForeignKey
ALTER TABLE "donations" DROP CONSTRAINT "donations_donorId_fkey";

-- DropForeignKey
ALTER TABLE "donor_screenings" DROP CONSTRAINT "donor_screenings_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "donor_screenings" DROP CONSTRAINT "donor_screenings_staffUserId_fkey";

-- DropForeignKey
ALTER TABLE "emergency_requests" DROP CONSTRAINT "emergency_requests_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "hospital_banks" DROP CONSTRAINT "hospital_banks_managedById_fkey";

-- DropForeignKey
ALTER TABLE "locations" DROP CONSTRAINT "locations_parentId_fkey";

-- DropIndex
DROP INDEX "donor_screenings_hospitalId_idx";

-- DropIndex
DROP INDEX "emergency_requests_hospitalId_idx";

-- AlterTable
ALTER TABLE "donor_screenings" DROP COLUMN "hospitalId",
ADD COLUMN     "alertId" UUID;

-- AlterTable
ALTER TABLE "emergency_alerts" ADD COLUMN     "donorConfirmedAt" TIMESTAMPTZ(6),
ADD COLUMN     "responseReason" TEXT;

-- AlterTable
ALTER TABLE "emergency_requests" DROP COLUMN "hospitalId";

-- AlterTable
ALTER TABLE "hospital_banks" DROP COLUMN "managedById",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "hospitalStaffRole",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "blacklistedAt" TIMESTAMPTZ(6),
ADD COLUMN     "deferredUntil" TIMESTAMPTZ(6),
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- DropEnum
DROP TYPE "HospitalStaffRole";

-- CreateIndex
CREATE INDEX "donor_screenings_alertId_idx" ON "donor_screenings"("alertId");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_alerts_requestId_donorId_key" ON "emergency_alerts"("requestId", "donorId");

-- CreateIndex
CREATE INDEX "hospital_banks_latitude_longitude_idx" ON "hospital_banks"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "user_latitude_longitude_idx" ON "user"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "user_role_isActive_bloodGroup_blacklistedAt_idx" ON "user"("role", "isActive", "bloodGroup", "blacklistedAt");

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donor_screenings" ADD CONSTRAINT "donor_screenings_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donor_screenings" ADD CONSTRAINT "donor_screenings_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "emergency_alerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
