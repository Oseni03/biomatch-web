-- Issue 21: idempotency key on voucher redemptions so a double-submitted
-- redemption form yields one voucher and one ledger debit. NULLs never
-- conflict in Postgres, so pre-existing rows are unaffected.
ALTER TABLE "voucher_redemptions" ADD COLUMN "idempotencyKey" TEXT;

CREATE UNIQUE INDEX "voucher_redemptions_donorId_idempotencyKey_key"
  ON "voucher_redemptions"("donorId", "idempotencyKey");
