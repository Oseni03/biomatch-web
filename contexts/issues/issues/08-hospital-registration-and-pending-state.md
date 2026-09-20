---
id: 08
title: "Hospital registration and pending-approval state"
type: AFK
prd: "§4.2, 5.1"
---

# 08. Hospital registration and pending-approval state

**Type:** AFK &nbsp;|&nbsp; **PRD:** §4.2, 5.1

## What to build

A hospital registers with organisation details and its official (hospitality) email. Registration creates the organisation with a pending verification status that the client can never set, makes the registering user the first member with the Owner role, and opens a pending verification application. Until approved, the hospital can sign in and see an awaiting-approval state but cannot create requests; this is enforced on the server, not just hidden in the UI.

## Acceptance criteria

- [ ] Registration form collects name, registration number, official email, phone, address, state, LGA and location pin
- [ ] Verification status and screening-partner flag cannot be supplied by the client at registration (tested)
- [ ] Exactly one pending verification application exists per hospital
- [ ] The registering user becomes an Owner member of the new organisation
- [ ] Pending hospitals see an awaiting-approval screen; attempts to create a request via the API are rejected
- [ ] Rejected and suspended states render a clear message (reapply flow arrives in slice 09)
- [ ] Empty states for every new screen are designed and implemented (required by the PRD)

## Blocked by

- [03 Walking skeleton: standalone backend, baseline schema, donor sign-up and sign-in](03-walking-skeleton.md)
- [04 NDPR consent gate](04-ndpr-consent-gate.md)
