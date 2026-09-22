-- Issue 21: rewrite apply_wallet_entry so debits work.
--
-- The old body used INSERT ... ON CONFLICT DO UPDATE. Postgres validates
-- CHECK constraints on the *proposed* row BEFORE conflict detection, so any
-- negative ledger delta (a voucher debit) violated donor_wallets_balance_chk
-- on the proposed row even when the existing balance covered it. Credits
-- always worked, which hid the bug until voucher issuance was tested.
--
-- UPDATE-first has no proposed-row check: the CHECK evaluates the final
-- balance, which is exactly the overdraft protection we want. The INSERT leg
-- only runs for brand-new wallets, where a negative opening entry is still
-- correctly rejected. The unique_violation fallback covers two concurrent
-- first credits racing past the UPDATE.
CREATE OR REPLACE FUNCTION apply_wallet_entry() RETURNS trigger AS $$
BEGIN
  UPDATE donor_wallets
     SET "balanceKobo" = donor_wallets."balanceKobo" + NEW."amountKobo",
         "updatedAt"   = now()
   WHERE "donorId" = NEW."donorId";
  IF FOUND THEN
    RETURN NEW;
  END IF;
  BEGIN
    INSERT INTO donor_wallets ("donorId", "balanceKobo", "updatedAt")
    VALUES (NEW."donorId", NEW."amountKobo", now());
  EXCEPTION WHEN unique_violation THEN
    UPDATE donor_wallets
       SET "balanceKobo" = donor_wallets."balanceKobo" + NEW."amountKobo",
           "updatedAt"   = now()
     WHERE "donorId" = NEW."donorId";
  END;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
