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

-- Step 3: Alter the column type
ALTER TABLE "emergency_alerts" ALTER COLUMN "status" TYPE "AlertStatus_new" USING ("status"::text::"AlertStatus_new");

-- Step 4: Drop old enum
DROP TYPE "AlertStatus";

-- Step 5: Rename new enum
ALTER TYPE "AlertStatus_new" RENAME TO "AlertStatus";

-- AlterTable
-- Add openedAt column for tracking when a donor views an alert
ALTER TABLE "emergency_alerts" ADD COLUMN "openedAt" TIMESTAMPTZ(6);
