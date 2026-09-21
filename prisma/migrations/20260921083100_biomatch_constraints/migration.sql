-- =====================================================================
-- BioMATCH: things Prisma cannot express
-- Append to the migration created with `prisma migrate dev --create-only`
-- (or ship as its own custom migration after the initial one).
--
-- Column names are camelCase and quoted, matching schema.prisma.
--
-- WARNING: Prisma does not model CHECK constraints, partial indexes or
-- triggers. If a later `prisma migrate dev` proposes DROP INDEX for one of
-- the partial indexes below, delete that statement from the generated
-- migration before applying it.
-- =====================================================================

-- ---------------------------------------------------------------------
-- CHECK constraints
-- ---------------------------------------------------------------------

-- Better Auth models
ALTER TABLE "organization"
  ADD CONSTRAINT organization_status_chk
    CHECK ("verificationStatus" IN ('pending','approved','rejected','suspended')),
  ADD CONSTRAINT organization_lat_chk CHECK (latitude  BETWEEN -90  AND 90),
  ADD CONSTRAINT organization_lng_chk CHECK (longitude BETWEEN -180 AND 180);

-- Expect E.164; also set phoneNumberValidator in the phoneNumber plugin config
ALTER TABLE "user"
  ADD CONSTRAINT user_phone_e164_chk
    CHECK ("phoneNumber" IS NULL OR "phoneNumber" ~ '^\+[1-9][0-9]{7,14}$');

-- Domain models
ALTER TABLE hospital_verifications
  ADD CONSTRAINT hv_review_consistency CHECK (
    (decision = 'pending' AND "reviewedAt" IS NULL)
    OR (decision <> 'pending' AND "reviewedAt" IS NOT NULL AND "reviewedBy" IS NOT NULL)
  ),
  ADD CONSTRAINT hv_reason_on_reject CHECK (decision <> 'rejected' OR "rejectionReason" IS NOT NULL);

ALTER TABLE donor_profiles
  ADD CONSTRAINT dp_home_lat_chk CHECK ("homeLatitude"  IS NULL OR "homeLatitude"  BETWEEN -90  AND 90),
  ADD CONSTRAINT dp_home_lng_chk CHECK ("homeLongitude" IS NULL OR "homeLongitude" BETWEEN -180 AND 180),
  ADD CONSTRAINT dp_last_lat_chk CHECK ("lastKnownLatitude"  IS NULL OR "lastKnownLatitude"  BETWEEN -90  AND 90),
  ADD CONSTRAINT dp_last_lng_chk CHECK ("lastKnownLongitude" IS NULL OR "lastKnownLongitude" BETWEEN -180 AND 180),
  -- BM- plus 6 chars from an unambiguous alphabet (no I, L, O, U)
  ADD CONSTRAINT dp_donor_code_chk CHECK ("donorCode" ~ '^BM-[0-9A-HJKMNP-TV-Z]{6}$');

ALTER TABLE blood_requests
  ADD CONSTRAINT br_units_chk CHECK ("unitsRequired" > 0),
  ADD CONSTRAINT br_cap_chk CHECK ("unitsAccepted" BETWEEN 0 AND "unitsRequired"),
  ADD CONSTRAINT br_lat_chk CHECK (latitude  BETWEEN -90  AND 90),
  ADD CONSTRAINT br_lng_chk CHECK (longitude BETWEEN -180 AND 180),
  ADD CONSTRAINT br_closed_consistency CHECK (
    (status IN ('closed','cancelled')) = ("closedAt" IS NOT NULL)
  );

ALTER TABLE donations
  ADD CONSTRAINT donation_dual_confirmation CHECK (
    status <> 'completed'
    OR ("donorConfirmedAt" IS NOT NULL AND "hospitalConfirmedAt" IS NOT NULL AND "completedAt" IS NOT NULL)
  );

ALTER TABLE donor_wallets
  ADD CONSTRAINT donor_wallets_balance_chk CHECK ("balanceKobo" >= 0);   -- blocks overdrafts

ALTER TABLE voucher_redemptions
  ADD CONSTRAINT vr_amount_chk CHECK ("amountKobo" > 0),
  ADD CONSTRAINT vr_redeemed_chk CHECK (
    status <> 'redeemed' OR ("redeemedAt" IS NOT NULL AND "redeemedByUserId" IS NOT NULL)
  );

ALTER TABLE wallet_transactions
  ADD CONSTRAINT wt_amount_chk CHECK ("amountKobo" <> 0),
  ADD CONSTRAINT wt_sign_matches_type CHECK (
    ("entryType" = 'donation_reward' AND "amountKobo" > 0)
    OR ("entryType" = 'redemption'   AND "amountKobo" < 0)
    OR "entryType" IN ('adjustment','reversal')
  );

-- ---------------------------------------------------------------------
-- Partial indexes
-- ---------------------------------------------------------------------
CREATE UNIQUE INDEX hv_one_pending_key
  ON hospital_verifications ("organizationId") WHERE decision = 'pending';
CREATE INDEX hv_queue_idx
  ON hospital_verifications ("submittedAt") WHERE decision = 'pending';

-- Donors who can actually be matched
CREATE INDEX donor_match_pool_idx
  ON donor_profiles ("bloodGroup", "homeLatitude", "homeLongitude")
  WHERE "verificationStatus" = 'verified' AND "donorStatus" = 'active' AND "isAvailable";

CREATE INDEX br_escalation_idx
  ON blood_requests ("nextEscalationAt") WHERE status = 'active';

CREATE INDEX notifications_unread_idx
  ON notifications ("userId") WHERE "readAt" IS NULL;

CREATE INDEX nd_pending_idx
  ON notification_deliveries ("createdAt") WHERE status IN ('queued','failed');

-- A donation can only ever be rewarded once
CREATE UNIQUE INDEX wt_one_reward_per_donation
  ON wallet_transactions ("donationId") WHERE "entryType" = 'donation_reward';

-- ---------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------

-- Wallet ledger is append-only
CREATE FUNCTION forbid_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% on % is not allowed (append-only table)', TG_OP, TG_TABLE_NAME;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wallet_immutable
  BEFORE UPDATE OR DELETE ON wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

-- Keep donor_wallets.balanceKobo in step with the ledger (same transaction)
CREATE FUNCTION apply_wallet_entry() RETURNS trigger AS $$
BEGIN
  INSERT INTO donor_wallets ("donorId", "balanceKobo", "updatedAt")
  VALUES (NEW."donorId", NEW."amountKobo", now())
  ON CONFLICT ("donorId") DO UPDATE
    SET "balanceKobo" = donor_wallets."balanceKobo" + EXCLUDED."balanceKobo",
        "updatedAt"   = now();
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wallet_apply
  AFTER INSERT ON wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION apply_wallet_entry();

-- Latest screening wins; only approved screening-partner hospitals may record one
CREATE FUNCTION sync_donor_verification() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "organization"
    WHERE id = NEW."organizationId"
      AND "isScreeningPartner"
      AND "verificationStatus" = 'approved'
  ) THEN
    RAISE EXCEPTION 'Hospital % is not an approved screening partner', NEW."organizationId";
  END IF;

  UPDATE donor_profiles
     SET "verificationStatus" = CASE NEW.result
                                  WHEN 'passed' THEN 'verified'::donor_verification_status
                                  ELSE 'failed'::donor_verification_status END,
         "verifiedAt" = CASE WHEN NEW.result = 'passed' THEN NEW."screenedAt" END
   WHERE "userId" = NEW."donorId";
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_donor_screenings_sync
  BEFORE INSERT ON donor_screenings
  FOR EACH ROW EXECUTE FUNCTION sync_donor_verification();

-- ---------------------------------------------------------------------
-- NDPR erasure: wipe personal data, keep de-identified donation history.
-- Better Auth requires a unique non-null email, so a placeholder is used.
-- Transfer hospital ownership BEFORE calling this: deleting `member` rows
-- here bypasses the organization plugin's last-owner protection.
-- ---------------------------------------------------------------------
CREATE FUNCTION anonymise_user(p_user uuid) RETURNS void AS $$
BEGIN
  UPDATE "user"
     SET name = 'Anonymised user',
         email = 'anonymised+' || id::text || '@anonymised.invalid',
         "emailVerified" = false,
         image = NULL,
         "phoneNumber" = NULL,
         "phoneNumberVerified" = false,
         banned = true,
         "banReason" = 'anonymised',
         "notifySms" = false, "notifyWhatsapp" = false,
         "notifyEmail" = false, "notifyPush" = false,
         "anonymisedAt" = now(),
         "updatedAt" = now()
   WHERE id = p_user;

  DELETE FROM session WHERE "userId" = p_user;
  DELETE FROM account WHERE "userId" = p_user;
  DELETE FROM member  WHERE "userId" = p_user;
  DELETE FROM merchant_staff WHERE "userId" = p_user;
  DELETE FROM notifications WHERE "userId" = p_user;

  UPDATE donor_profiles
     SET "dateOfBirth" = NULL, "homeAddress" = NULL,
         "homeLatitude" = NULL, "homeLongitude" = NULL,
         "lastKnownLatitude" = NULL, "lastKnownLongitude" = NULL, "lastKnownAt" = NULL,
         "isAvailable" = false, "updatedAt" = now()
   WHERE "userId" = p_user;

  UPDATE donor_screenings SET notes = NULL WHERE "donorId" = p_user;
  UPDATE consent_records
     SET "revokedAt" = COALESCE("revokedAt", now())
   WHERE "userId" = p_user;
END $$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- Seed data (or move into prisma/seed.ts)
-- Permissions are NOT seeded: the catalog lives in code (access-control.ts).
-- Tunable values (cooldown, radii, reward) live in the backend config (config.ts).
-- ---------------------------------------------------------------------
INSERT INTO blood_compatibility ("recipientGroup", "donorGroup") VALUES
  ('O-','O-'),
  ('O+','O+'),('O+','O-'),
  ('A-','A-'),('A-','O-'),
  ('A+','A+'),('A+','A-'),('A+','O+'),('A+','O-'),
  ('B-','B-'),('B-','O-'),
  ('B+','B+'),('B+','B-'),('B+','O+'),('B+','O-'),
  ('AB-','AB-'),('AB-','A-'),('AB-','B-'),('AB-','O-'),
  ('AB+','AB+'),('AB+','AB-'),('AB+','A+'),('AB+','A-'),
  ('AB+','B+'),('AB+','B-'),('AB+','O+'),('AB+','O-');

-- =====================================================================
-- BACKEND NOTES
-- =====================================================================
-- 1) Atomic accept (enforces the cap; run in one transaction):
--
--   UPDATE blood_requests
--      SET "unitsAccepted" = "unitsAccepted" + 1,
--          status = CASE WHEN "unitsAccepted" + 1 >= "unitsRequired"
--                        THEN 'fulfilled'::request_status ELSE status END
--    WHERE id = $1 AND status = 'active' AND "unitsAccepted" < "unitsRequired"
--   RETURNING id;
--
--   0 rows -> set this match to 'filled'.
--   1 row  -> set match 'accepted', insert the donations row, notify hospital.
--   When a request becomes 'fulfilled', set remaining 'notified' matches to 'filled'.
--   If an accepted donor drops out: "unitsAccepted" - 1 and status back to 'active'.
--
-- 2) On donation completion (both confirmations present), one transaction:
--   - donations: status = 'completed', completedAt = now()
--   - donor_profiles: lastDonatedAt = completedAt,
--       cooldownUntil = completedAt + COOLDOWN_DAYS (config.ts)
--   - wallet_transactions: INSERT donation_reward (REWARD_CREDIT_KOBO from config.ts)
--   - request_matches: status = 'completed'
--
-- 3) Eligible-donor query (Haversine; add a bounding-box prefilter if scale needs it).
--    $1 = request id, $2 = radius km, $3 = LOCATION_FRESH_HOURS (config.ts):
--
--   WITH r AS (
--     SELECT id, "bloodGroup", latitude, longitude FROM blood_requests WHERE id = $1
--   )
--   SELECT d."userId", dist.km
--   FROM r
--   JOIN blood_compatibility c ON c."recipientGroup" = r."bloodGroup"
--   JOIN donor_profiles d ON d."bloodGroup" = c."donorGroup"
--   JOIN "user" u ON u.id = d."userId" AND COALESCE(u.banned, false) = false
--   CROSS JOIN LATERAL (
--     SELECT CASE WHEN d."lastKnownAt" > now() - make_interval(hours => $3)
--                 THEN d."lastKnownLatitude"  ELSE d."homeLatitude"  END AS lat,
--            CASE WHEN d."lastKnownAt" > now() - make_interval(hours => $3)
--                 THEN d."lastKnownLongitude" ELSE d."homeLongitude" END AS lng
--   ) loc
--   CROSS JOIN LATERAL (
--     SELECT 2 * 6371 * asin(LEAST(1.0, sqrt(
--              power(sin(radians(loc.lat - r.latitude) / 2), 2)
--            + cos(radians(r.latitude)) * cos(radians(loc.lat))
--              * power(sin(radians(loc.lng - r.longitude) / 2), 2)))) AS km
--   ) dist
--   WHERE d."verificationStatus" = 'verified'
--     AND d."donorStatus" = 'active'
--     AND d."isAvailable"
--     AND (d."cooldownUntil" IS NULL OR d."cooldownUntil" <= now())
--     AND dist.km <= $2
--     AND NOT EXISTS (SELECT 1 FROM request_matches m
--                      WHERE m."requestId" = r.id AND m."donorId" = d."userId")
--   ORDER BY dist.km;
--
--   Phone verification does NOT affect matching. Donors without a verified phone
--   are matched and get in-app (and email) alerts; SMS and WhatsApp are only sent
--   to donors whose phone is verified, decided at notification time.
--
-- 4) Hospital approval: insert the hospital_verifications decision, update
--    organization."verificationStatus" (+ "approvedAt") in the same transaction,
--    write audit_logs. Gate request creation on verificationStatus = 'approved'.
--
-- 5) App-layer rules: single platform admin (user.role = 'admin'); only
--    approved hospitals create requests; only members whose role has
--    bloodRequest:create can create them; suspended users = user.banned.
--
-- 6) Merchant redemption (merchant staff sign in as normal Better Auth users).
--    Preview and confirm both use the same conditions; $1 = code, $2 = staff user id.
--    Zero rows = invalid, already used, expired, or another merchant's code
--    (do not tell the cashier which).
--
--   UPDATE voucher_redemptions r
--      SET status = 'redeemed', "redeemedAt" = now(), "redeemedByUserId" = $2
--     FROM merchant_staff s
--    WHERE r.code = $1
--      AND r.status = 'issued' AND r."expiresAt" > now()
--      AND s."userId" = $2 AND s."isActive" AND s."merchantId" = r."merchantId"
--   RETURNING r.id, r."amountKobo";
--
--    A background job sets issued codes past "expiresAt" to 'expired'.
--    Whether expired codes refund the donor (a 'reversal' ledger credit) is undecided.
--    Merchant staff pass the same consent gate as everyone else.
