-- AddColumn (nullable first so we can backfill in creation order)
ALTER TABLE "hospital_banks" ADD COLUMN "sequenceNumber" INTEGER;

-- Backfill existing rows sequentially in onboarding (createdAt) order
WITH ordered AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt") AS rn
  FROM "hospital_banks"
)
UPDATE "hospital_banks" hb
SET "sequenceNumber" = ordered.rn
FROM ordered
WHERE hb."id" = ordered."id";

-- CreateSequence, seeded past the highest backfilled value (or left to
-- start at 1 if the table is currently empty — setval rejects 0)
CREATE SEQUENCE IF NOT EXISTS "hospital_banks_sequenceNumber_seq";
SELECT setval(
  '"hospital_banks_sequenceNumber_seq"',
  COALESCE((SELECT MAX("sequenceNumber") FROM "hospital_banks"), 1),
  (SELECT COUNT(*) FROM "hospital_banks") > 0
);
ALTER SEQUENCE "hospital_banks_sequenceNumber_seq" OWNED BY "hospital_banks"."sequenceNumber";

-- Wire the column to the sequence and enforce constraints
ALTER TABLE "hospital_banks" ALTER COLUMN "sequenceNumber" SET DEFAULT nextval('"hospital_banks_sequenceNumber_seq"');
ALTER TABLE "hospital_banks" ALTER COLUMN "sequenceNumber" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "hospital_banks_sequenceNumber_key" ON "hospital_banks"("sequenceNumber");
