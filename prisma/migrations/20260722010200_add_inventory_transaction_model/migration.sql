-- CreateEnum
CREATE TYPE "InventoryTransactionReason" AS ENUM ('donation', 'dispatch', 'manual_adjustment', 'expiry');

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hospitalBankId" UUID NOT NULL,
    "bloodGroup" "BloodGroup" NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" "InventoryTransactionReason" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_transactions_hospitalBankId_idx" ON "inventory_transactions"("hospitalBankId");

-- CreateIndex
CREATE INDEX "inventory_transactions_bloodGroup_idx" ON "inventory_transactions"("bloodGroup");

-- CreateIndex
CREATE INDEX "inventory_transactions_createdAt_idx" ON "inventory_transactions"("createdAt");

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_hospitalBankId_fkey" FOREIGN KEY ("hospitalBankId") REFERENCES "hospital_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
