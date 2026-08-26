-- CreateEnum: HospitalStaffRole
CREATE TYPE "HospitalStaffRole" AS ENUM ('admin', 'requester', 'viewer');

-- AlterTable: add typed column
ALTER TABLE "user" ADD COLUMN "hospitalStaffRole" "HospitalStaffRole";

-- Backfill from updatedHealthInfo JSON
UPDATE "user"
SET "hospitalStaffRole" = CASE
  WHEN "updatedHealthInfo"->>'staffRole' = 'admin' THEN 'admin'::"HospitalStaffRole"
  WHEN "updatedHealthInfo"->>'staffRole' = 'requester' THEN 'requester'::"HospitalStaffRole"
  WHEN "updatedHealthInfo"->>'staffRole' = 'viewer' THEN 'viewer'::"HospitalStaffRole"
END
WHERE "updatedHealthInfo"->>'staffRole' IS NOT NULL;
