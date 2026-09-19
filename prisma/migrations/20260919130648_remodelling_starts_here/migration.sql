-- AlterTable
ALTER TABLE "user" ADD COLUMN     "emergencyOnly" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "preferredHospital" TEXT;
