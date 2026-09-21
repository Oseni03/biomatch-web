---
id: 02
title: "Messaging providers and WhatsApp template approval"
type: HITL
prd: "§6"
---

# 02. Messaging providers and WhatsApp template approval

**Type:** HITL &nbsp;|&nbsp; **PRD:** §6

## What to build

Set up the external messaging accounts and start the approval processes, which have long lead times and can block the alerts slice. Run this in parallel with everything else, starting immediately.

Scope: choose and register an SMS provider (with a registered sender ID for Nigeria) that also delivers OTP codes; choose a WhatsApp Business API provider, complete business verification, and submit the fixed alert template for approval; confirm email stays on the existing Resend integration. The alert template shows blood type needed, hospital name, hospital location, and a prompt to open the app. It never contains patient details, and donors never reply to it.

## Acceptance criteria

- [ ] SMS provider chosen, account created, sender ID registration submitted
- [ ] WhatsApp Business account verified and the alert template submitted for approval, with status tracked
- [x] Final template wording agreed and contains no patient-identifying information
- [ ] Sandbox or test credentials are available to developers for slices 07 and 17
- [ ] Expected per-message costs are documented
- [x] Decision recorded (provider names, sender ID, template ID)

## Decisions (recorded 2026-09-21 in `docs/adr/009-messaging-providers.md`, decider: project owner)

- SMS + OTP: Termii. Sender ID (proposed, not yet submitted): `BioMatch`.
- WhatsApp: Meta WhatsApp Cloud API direct. Template ID: pending submission.
- Email: stays on Resend.
- Alert template wording approved as in ADR 009 (blood type, hospital
  name/location, open-app prompt; no patient details).
- Costs unverified at decision time; document actuals from dashboards once
  accounts exist. Account creation, verification, and template submission
  are human actions outside the repo (checklist in ADR 009).

## Blocked by

None - can start immediately
