## What to build

Implement push notification and SMS delivery for emergency alerts. When the matching engine selects donors, push notifications are sent as the primary channel. For standard urgency, SMS is sent as a fallback if the push is not opened within 2 minutes. For critical urgency, SMS is sent simultaneously with push. Delivery status is tracked per donor per channel.

## What's Done (Email — June 2026)

Email notification is implemented as an incremental step:

- **Resend** SDK + `lib/email.ts` — sends React Email templates, mocks when `RESEND_API_KEY` not set
- **`emails/emergency-alert.tsx`** — React Email template with blood type, hospital name, distance, urgency, accept button
- **`servers/notification.ts`** — `sendEmergencyAlertEmail(alertId)` server action, logs to `NotificationLog`
- **Wired** into `servers/emergency.ts:createEmergencyRequest()` — sends email to each matched donor immediately after `createMany`, non-blocking via `Promise.allSettled`
- **`NotificationLog`** model in Prisma — `alertId`, `channel` (email), `status` (sent/failed/delivered/opened), `providerMessageId`, `errorMessage`
- **Env vars**: `RESEND_API_KEY`, `EMAIL_FROM=noreply@biomatch.com`

**Remaining**: Push notifications and SMS fallback (awaiting HITL decisions on providers).

### HITL Decisions Required

1. **Push channel**: Browser push API (web app) vs FCM (Android) vs APNs (iOS) — determines implementation approach
2. **SMS provider**: Twilio, Africa's Talking, Termii, or other provider suitable for Nigerian GSM networks
3. **"Opened" tracking**: How is push open detected? (Web: Notification-click event. Mobile: FCM/APNs callback.)

### Schema — NotificationLog

- `id` (UUID), `alertId` (FK to EmergencyAlert), `channel` (enum: push/sms), `status` (enum: sent/delivered/opened/failed), `providerMessageId` (String?), `sentAt`, `deliveredAt?`, `openedAt?`, `errorMessage?`

### Server actions

- `sendPushNotification(alertId, donorId, requestDetails)` — sends push via configured provider
- `sendSmsNotification(alertId, donorId, requestDetails)` — sends SMS via configured provider
- `checkAndSendFallbackSms(requestId)` — scheduled check: for alerts where push not opened in 2 min, send SMS
- `recordNotificationOpen(alertId, channel)` — callback/webhook endpoint for open tracking

### Notification content

Includes: blood type needed, hospital name, approximate distance, single-tap accept URL (deep link or web URL)

## Acceptance criteria

- [ ] Push notification is sent when a donor is matched to an emergency request
- [ ] For standard urgency, SMS is sent if push is not opened within 2 minutes
- [ ] For critical urgency, SMS is sent simultaneously with push (no delay)
- [ ] Notification delivery is logged in NotificationLog with status tracking
- [ ] Notification content includes blood type, hospital name, distance, and accept action
- [ ] SMS works on any GSM network without data (plain SMS, not rich media)
- [ ] Failed delivery is recorded with error message for retry/debugging

## Blocked by

- Issue 01 — Emergency Request + Matching Engine
