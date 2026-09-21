# ADR 009 — Messaging providers and WhatsApp template

- Status: Accepted (2026-09-21, HITL decision on remodel issue 02)
- Decider: project owner

## Context

Remodel issue 02 (PRD §6) needs an SMS provider with a registered sender ID
for Nigeria (also delivering OTP codes for slice 07), a WhatsApp Business
API provider plus an approved alert template (consumed by slice 17), and
confirmation that email stays on Resend. Approval processes have long lead
times, so accounts start now, in parallel with everything else.

## Decision

- SMS + OTP: Termii (Nigerian provider, NCC sender-ID registration flow,
  OTP product, naira billing).
- WhatsApp: Meta WhatsApp Cloud API direct (no BSP margin; requires
  Facebook Business verification and template approval; test numbers for
  development).
- Email: stays on the existing Resend integration (`src/lib/email.ts`).
- Sender ID (proposed, registration to be submitted): `BioMatch`.
- WhatsApp template ID: pending submission (see human actions).

## Approved alert template (utility category)

`URGENT: {{hospital_name}} ({{hospital_location}}) needs blood type {{blood_group}}. Open your BioMatch app to respond.`

Contains only blood type needed, hospital name, hospital location, and an
open-the-app prompt. No patient details; donors never reply to it.

## Consequences

- Slice 07 builds the phone-number plugin's `sendSms` against Termii's API
  (tests use a fake provider); slice 17 builds per-channel delivery rows and
  the WhatsApp→SMS fallback against the Meta Cloud API, with webhooks
  landing on Next.js API routes (single host, ADR 004).
- Provider credential env var names are decided when slices 07/17 land, not
  here. Secrets go to provider dashboards / `.env.local`, never committed.
- Per-message costs were not verifiable at decision time (no live pricing
  source); document actuals from the Termii and Meta dashboards when the
  accounts exist (issue 02 criterion 5).

## Human actions (outside the repo, start immediately)

- [ ] Create Termii account; submit `BioMatch` sender-ID registration.
- [ ] Complete Facebook Business verification; create WhatsApp app, submit
      the alert template above for approval; track approval status.
- [ ] Make Termii test-mode credentials and a Meta WhatsApp test number
      available to developers for slices 07 and 17.
