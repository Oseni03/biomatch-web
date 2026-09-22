---
id: 07
title: "Phone number and OTP verification in profile settings"
type: AFK
prd: "§4.3, 6"
---

# 07. Phone number and OTP verification in profile settings

**Type:** AFK &nbsp;|&nbsp; **PRD:** §4.3, 6

## What to build

From profile settings a donor (or any user) adds a phone number and verifies it with an SMS one-time code using the phone number plugin. Verification is optional for using the app and for being matched; it only decides whether SMS and WhatsApp alerts are sent later. Numbers are validated and stored in E.164 format.

## Acceptance criteria

- [x] User can add or change a phone number and receives an OTP by SMS
- [x] Entering the correct code marks the phone as verified; wrong or expired codes are rejected
- [x] Changing the number resets verification
- [x] OTP requests are rate limited
- [x] Phone is unique across users and validated as E.164
- [x] The UI shows verified/unverified state and explains that verification enables SMS and WhatsApp alerts
- [x] Tests use a fake SMS provider

## Implementation (recorded 2026-09-22)

Built on the Next.js server layer per ADR 001 (no separate backend service):
`src/lib/sms.ts` (Termii `sendSms` per ADR 009 + `fake` provider with an
in-memory outbox for tests/dev; `SMS_PROVIDER`, `TERMII_API_KEY`,
`TERMII_SENDER_ID`, `TERMII_CHANNEL` env names decided here, documented in
`.env.local.example`), `src/lib/phone-validation.ts` (E.164 regex shared with
the plugin validator, Nigerian local-format normalization, zod schema),
better-auth `phoneNumber` plugin enabled in `src/lib/auth.ts` (6-digit OTP,
5-minute expiry, 3 attempts, no phone sign-in, verification optional for app
use and matching) with `phoneNumberClient()` in `src/lib/auth-client.ts`, and
`src/servers/user.ts` (`getPhoneVerificationState`, `setPhoneNumber` which
saves the normalized number with `phoneNumberVerified: false` so changing the
number resets verification with a uniqueness pre-check plus P2002 mapping,
`requestPhoneOtp` with a 60s resend cooldown and 5/hour cap per number on top
of the existing `/phone-number/*` rate-limit customRules — all behind the
issue-04 consent gate). `src/components/profile/phone-verification.tsx`
(add/change number, 6-digit code entry, resend, verified/unverified states,
SMS+WhatsApp explainer) mounted on `/donor/profile` and `/hospital/profile`.
`tests/phone-verification.test.ts` drives the real plugin endpoints against
the fake provider (normalization, outbox capture, full OTP round-trip, wrong
and expired rejection, change-resets-verification, cross-user uniqueness,
cooldown and hourly cap — 11 passing).

## Blocked by

- [02 Messaging providers and WhatsApp template approval](02-messaging-providers-and-whatsapp-template.md)
- [06 Donor profile: blood group, home pin, availability and donor code](06-donor-profile-and-donor-code.md)
