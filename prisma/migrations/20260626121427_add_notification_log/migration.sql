-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('email');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('sent', 'delivered', 'opened', 'failed');

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "alertId" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'sent',
    "providerMessageId" TEXT,
    "sentAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMPTZ(6),
    "openedAt" TIMESTAMPTZ(6),
    "errorMessage" TEXT,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_logs_alertId_idx" ON "notification_logs"("alertId");

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "emergency_alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
