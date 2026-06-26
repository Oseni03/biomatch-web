/*
  Warnings:

  - The `availability` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('weekdays', 'weekends', 'mornings', 'afternoons', 'evenings', 'anytime');

-- AlterTable
ALTER TABLE "user" DROP COLUMN "availability",
ADD COLUMN     "availability" "Availability";
