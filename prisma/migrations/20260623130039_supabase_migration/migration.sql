-- CreateEnum
CREATE TYPE "Role" AS ENUM ('donor', 'hospital', 'admin');

-- CreateEnum
CREATE TYPE "IncentiveType" AS ENUM ('hmo_voucher', 'gym_discount');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('pending', 'approved', 'redeemed');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_PLUS', 'A_MINUS', 'B_PLUS', 'B_MINUS', 'AB_PLUS', 'AB_MINUS', 'O_PLUS', 'O_MINUS');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fullName" TEXT NOT NULL,
    "bloodGroup" "BloodGroup",
    "genotype" TEXT,
    "role" "Role" NOT NULL DEFAULT 'donor',
    "updatedHealthInfo" JSONB NOT NULL DEFAULT '{}',
    "lastDonationDate" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_banks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hospitalName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "inventory" JSONB NOT NULL DEFAULT '{"A+": 0, "A-": 0, "B+": 0, "B-": 0, "AB+": 0, "AB-": 0, "O+": 0, "O-": 0}',
    "managedById" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "hospital_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "lifetimeDonations" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incentives_claims" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" "IncentiveType" NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'pending',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "incentives_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profiles_role_idx" ON "profiles"("role");

-- CreateIndex
CREATE INDEX "profiles_bloodGroup_idx" ON "profiles"("bloodGroup");

-- CreateIndex
CREATE INDEX "profiles_lastDonationDate_idx" ON "profiles"("lastDonationDate");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE INDEX "incentives_claims_userId_idx" ON "incentives_claims"("userId");

-- CreateIndex
CREATE INDEX "incentives_claims_status_idx" ON "incentives_claims"("status");

-- AddForeignKey
ALTER TABLE "hospital_banks" ADD CONSTRAINT "hospital_banks_managedById_fkey" FOREIGN KEY ("managedById") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incentives_claims" ADD CONSTRAINT "incentives_claims_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
