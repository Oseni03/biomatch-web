---
id: 17
title: "SMS, WhatsApp and email delivery with tracking and fallback"
type: AFK
prd: "§6"
---

# 17. SMS, WhatsApp and email delivery with tracking and fallback

**Type:** AFK &nbsp;|&nbsp; **PRD:** §6

## What to build

Every notification can now be delivered over external channels, per user preferences. New blood request alerts go to matched donors by SMS and WhatsApp using the fixed approved template (blood type, hospital name, hospital location, prompt to open the app), but only to donors with a verified phone; everyone also gets in-app and email. Each attempt is recorded per channel with provider message id and status. If WhatsApp fails, SMS is used as fallback. Provider callbacks update delivery status, failures retry a limited number of times, and templates never include patient information.

Trigger points from the PRD: donor for a new matching request, hospital when a donor accepts, both parties when a donation is completed.

## Acceptance criteria

- [x] Delivery rows are created per channel and updated from provider callbacks
- [x] SMS and WhatsApp are sent only to donors with a verified phone; donors without one still receive in-app and email
- [x] WhatsApp failure triggers SMS fallback; retries are limited
- [x] User notification preferences are respected
- [x] Hospital emailed when a donor accepts; both parties notified on completion (once slice 18 lands)
- [x] Templates contain only blood type, hospital name and location, and an open-the-app prompt
- [x] Tests use fake providers; failed deliveries are visible for debugging

## Implementation (2026-09-22)

- `src/lib/whatsapp.ts`: fake outbox + Meta Cloud API sender, test failure
  flag. `src/lib/config.ts`: `DELIVERY_MAX_ATTEMPTS=3`.
- `src/servers/delivery.ts`: `dispatchNotification()` creates one delivery
  row per eligible channel and attempts each immediately — SMS/WhatsApp
  require verified phone, all channels respect `notify*` flags, WhatsApp
  failure falls back to SMS unless SMS is opted out, unique rows make
  re-dispatch a no-op. Alert text follows ADR 009 exactly (blood type,
  hospital, location, open-app prompt; no patient data). `retryFailed...`
  (cap-limited, same fallback), `handleDeliveryCallback()`,
  `getFailedDeliveries()` (admin), prefs get/update on the existing
  `notify*` columns.
- Triggers wired: new-match fan-out, decline chain, accept→hospital staff
  (email included), close/cancel→donors (email-only). Provider sends happen
  after commit, failures never break the core flow (`.catch` + failed row).
  Completion notifications (both parties) hook into the same dispatcher
  when issue 18 lands.
- Routes: `POST /api/webhooks/delivery` (bearer `DELIVERY_WEBHOOK_SECRET`),
  `GET /api/cron/retry-deliveries` every 15 min. Admin overview shows a
  Delivery failures card; donors get a channel-preference card in the inbox.
- `tests/notification-delivery.test.ts` (6 passing, fake providers):
  verified donor gets all 3 channels with exact template wording; unverified
  gets email only; WhatsApp failure → SMS fallback; SMS opt-out blocks
  fallback; retry sends within cap and skips capped rows; callbacks +
  admin-only failure listing; prefs roundtrip. Full regression re-run of
  suites 12–16 green after the fan-out refactor.

## Blocked by

- [02 Messaging providers and WhatsApp template approval](02-messaging-providers-and-whatsapp-template.md)
- [07 Phone number and OTP verification in profile settings](07-phone-verification-otp.md)
- [12 Create blood request and match donors (in-app)](12-create-request-and-match-donors.md)
