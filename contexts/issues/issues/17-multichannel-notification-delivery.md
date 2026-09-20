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

- [ ] Delivery rows are created per channel and updated from provider callbacks
- [ ] SMS and WhatsApp are sent only to donors with a verified phone; donors without one still receive in-app and email
- [ ] WhatsApp failure triggers SMS fallback; retries are limited
- [ ] User notification preferences are respected
- [ ] Hospital emailed when a donor accepts; both parties notified on completion (once slice 18 lands)
- [ ] Templates contain only blood type, hospital name and location, and an open-the-app prompt
- [ ] Tests use fake providers; failed deliveries are visible for debugging

## Blocked by

- [02 Messaging providers and WhatsApp template approval](02-messaging-providers-and-whatsapp-template.md)
- [07 Phone number and OTP verification in profile settings](07-phone-verification-otp.md)
- [12 Create blood request and match donors (in-app)](12-create-request-and-match-donors.md)
