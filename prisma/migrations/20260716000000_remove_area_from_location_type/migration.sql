-- AlterEnum
-- This migration safely removes 'area' from the LocationType enum.
-- Step 1: Verify no rows use the value being removed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "locations" WHERE "type" = 'area') THEN
    RAISE EXCEPTION 'Cannot remove "area" from LocationType enum: there are still rows using this value';
  END IF;
END $$;

-- Step 2: Create new enum without 'area'
CREATE TYPE "LocationType_new" AS ENUM ('region', 'state', 'city');

-- Step 3: Alter the column type
ALTER TABLE "locations" ALTER COLUMN "type" TYPE "LocationType_new" USING ("type"::text::"LocationType_new");

-- Step 4: Drop old enum
DROP TYPE "LocationType";

-- Step 5: Rename new enum
ALTER TYPE "LocationType_new" RENAME TO "LocationType";
