-- AlterEnum
-- Safely remove 'opened' from the AlertStatus enum.
-- Step 1: Verify no rows use the value being removed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "emergency_alerts" WHERE "status" = 'opened') THEN
    RAISE EXCEPTION 'Cannot remove "opened" from AlertStatus enum: there are still rows using this value';
  END IF;
END $$;

-- Step 2: Create new enum without 'opened'
CREATE TYPE "AlertStatus_new" AS ENUM ('alerted', 'accepted', 'declined', 'en_route', 'arrived', 'completed');

-- Step 3: Drop the column default; Postgres cannot auto-cast it to the new enum type
ALTER TABLE "emergency_alerts" ALTER COLUMN "status" DROP DEFAULT;

-- Step 4: Alter the column type
ALTER TABLE "emergency_alerts" ALTER COLUMN "status" TYPE "AlertStatus_new" USING ("status"::text::"AlertStatus_new");

-- Step 5: Drop old enum
DROP TYPE "AlertStatus";

-- Step 6: Rename new enum
ALTER TYPE "AlertStatus_new" RENAME TO "AlertStatus";

-- Step 7: Restore the column default on the renamed type
ALTER TABLE "emergency_alerts" ALTER COLUMN "status" SET DEFAULT 'alerted'::"AlertStatus";

-- AlterTable
-- Add openedAt column for tracking when a donor views an alert
ALTER TABLE "emergency_alerts" ADD COLUMN "openedAt" TIMESTAMPTZ(6);
