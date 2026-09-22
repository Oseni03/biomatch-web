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

- [x] Registration form collects name, registration number, official email, phone, address, state, LGA and location pin
- [x] Verification status and screening-partner flag cannot be supplied by the client at registration (tested)
- [x] Exactly one pending verification application exists per hospital
- [x] The registering user becomes an Owner member of the new organisation
- [x] Pending hospitals see an awaiting-approval screen; attempts to create a request via the API are rejected
- [x] Rejected and suspended states render a clear message (reapply flow arrives in slice 09)
- [x] Empty states for every new screen are designed and implemented (required by the PRD)

## Implementation (2026-09-22)

- `src/servers/organization.ts`: `getOrganizationVerificationStatus` +
  `requireApprovedHospital` (throws "awaiting approval" unless approved).
- `src/servers/emergency.ts`: `createEmergencyRequest` calls the gate first,
  so pending hospitals are rejected on the server even though request creation
  itself arrives in slice 12.
- `src/servers/hospital.ts`: real `getHospitalSidebarContext` from the
  organization row (status-mapped blood-bank state); new
  `getHospitalVerificationState`; removed the dead `createHospitalBank` stub
  (registration goes through the organization plugin).
- `src/components/hospital/awaiting-approval.tsx`: pending / rejected /
  suspended / no-organization states with what-happens-next and empty states;
  rendered by `/hospital` dashboard and `/hospital/emergency` for unapproved
  workspaces (profile stays accessible for settings).
- `/auth/signup?role=hospital`: added required registration number and an
  explicit location pin (editable lat/lng, find-from-address, pin-set and
  no-pin empty states); submit geocodes when no pin is set and validates ranges.
- `tests/hospital-verification.test.ts` (4 passing): privileged fields
  (`verificationStatus`, `isScreeningPartner`, `approvedAt`) stripped at
  creation; exactly one pending application + DB rejects a second (`hv_one_pending_key`);
  pending blocked from `requireApprovedHospital` and `createEmergencyRequest`;
  gate passes once approved, rejects again when rejected.

## Blocked by

- [03 Walking skeleton: standalone backend, baseline schema, donor sign-up and sign-in](03-walking-skeleton.md)
- [04 NDPR consent gate](04-ndpr-consent-gate.md)
