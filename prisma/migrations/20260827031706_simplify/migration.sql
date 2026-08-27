/*
  Warnings:

  - The values [screening_failed] on the enum `AlertStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `locationId` on the `hospital_banks` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `donor_screenings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inventory_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `locations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AlertStatus_new" AS ENUM ('alerted', 'accepted', 'declined', 'withdrawn', 'en_route', 'arrived', 'completed');
ALTER TABLE "public"."emergency_alerts" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "emergency_alerts" ALTER COLUMN "status" TYPE "AlertStatus_new" USING ("status"::text::"AlertStatus_new");
ALTER TYPE "AlertStatus" RENAME TO "AlertStatus_old";
ALTER TYPE "AlertStatus_new" RENAME TO "AlertStatus";
DROP TYPE "public"."AlertStatus_old";
ALTER TABLE "emergency_alerts" ALTER COLUMN "status" SET DEFAULT 'alerted';
COMMIT;

-- DropForeignKey
ALTER TABLE "donor_screenings" DROP CONSTRAINT "donor_screenings_alertId_fkey";

-- DropForeignKey
ALTER TABLE "donor_screenings" DROP CONSTRAINT "donor_screenings_donorId_fkey";

-- DropForeignKey
ALTER TABLE "donor_screenings" DROP CONSTRAINT "donor_screenings_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "donor_screenings" DROP CONSTRAINT "donor_screenings_staffUserId_fkey";

-- DropForeignKey
ALTER TABLE "hospital_banks" DROP CONSTRAINT "hospital_banks_locationId_fkey";

-- DropForeignKey
ALTER TABLE "inventory_transactions" DROP CONSTRAINT "inventory_transactions_hospitalBankId_fkey";

-- DropForeignKey
ALTER TABLE "locations" DROP CONSTRAINT "locations_parentId_fkey";

-- DropForeignKey
ALTER TABLE "notification_logs" DROP CONSTRAINT "notification_logs_alertId_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_locationId_fkey";

-- DropIndex
DROP INDEX "hospital_banks_locationId_idx";

-- DropIndex
DROP INDEX "user_locationId_idx";

-- AlterTable
ALTER TABLE "hospital_banks" DROP COLUMN "locationId";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "locationId";

-- DropTable
DROP TABLE "donor_screenings";

-- DropTable
DROP TABLE "inventory_transactions";

-- DropTable
DROP TABLE "locations";

-- DropTable
DROP TABLE "notification_logs";

-- DropEnum
DROP TYPE "InventoryTransactionReason";

-- DropEnum
DROP TYPE "LocationType";

-- DropEnum
DROP TYPE "NotificationChannel";

-- DropEnum
DROP TYPE "NotificationStatus";

-- DropEnum
DROP TYPE "ScreeningStatus";
