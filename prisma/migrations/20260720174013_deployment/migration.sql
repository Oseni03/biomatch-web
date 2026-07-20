/*
  Warnings:

  - You are about to drop the `incentives_claims` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "incentives_claims" DROP CONSTRAINT "incentives_claims_userId_fkey";

-- DropTable
DROP TABLE "incentives_claims";

-- DropEnum
DROP TYPE "ClaimStatus";

-- DropEnum
DROP TYPE "IncentiveType";
