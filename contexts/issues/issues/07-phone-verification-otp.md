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

- [ ] User can add or change a phone number and receives an OTP by SMS
- [ ] Entering the correct code marks the phone as verified; wrong or expired codes are rejected
- [ ] Changing the number resets verification
- [ ] OTP requests are rate limited
- [ ] Phone is unique across users and validated as E.164
- [ ] The UI shows verified/unverified state and explains that verification enables SMS and WhatsApp alerts
- [ ] Tests use a fake SMS provider

## Blocked by

- [02 Messaging providers and WhatsApp template approval](02-messaging-providers-and-whatsapp-template.md)
- [06 Donor profile: blood group, home pin, availability and donor code](06-donor-profile-and-donor-code.md)
