-- AlterTable
ALTER TABLE "user" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
