---
id: 06
title: "Donor profile: blood group, home pin, availability and donor code"
type: AFK
prd: "§4.3, 5.2"
---

# 06. Donor profile: blood group, home pin, availability and donor code

**Type:** AFK &nbsp;|&nbsp; **PRD:** §4.3, 5.2

## What to build

A signed-in donor completes and edits their profile: blood group, date of birth, home address with a map pin (latitude and longitude, plus state and LGA), and an availability toggle. The Profile screen shows their verification status (unverified, verified, failed). When the app is opened with location permission, the donor's last-known location is updated.

Every donor profile gets a unique, non-sequential donor code that the donor can see and copy in the app; partner-hospital staff use it later to find them for screening. Format: `BM-` followed by 6 characters from an unambiguous alphabet (no I, L, O, U), generated randomly server-side with collision retry.

## Acceptance criteria

- [x] Donor can create and edit profile fields; invalid coordinates are rejected
- [x] Availability toggle persists and is visible to the donor
- [x] A unique donor code in the agreed format is generated at profile creation and displayed with a copy action
- [x] Verification status badge reflects the stored status; new donors show unverified
- [x] Last-known location update endpoint exists and is called when the app opens with permission
- [x] Unverified donors can browse but the UI explains they need physical screening at a partner hospital
- [x] Tests cover code uniqueness and format
- [x] Empty states for every new screen are designed and implemented (required by the PRD)

## Implementation (recorded 2026-09-22)

Built on the Next.js server layer per ADR 001 (no separate backend service):
`src/lib/donor-code.ts` (BM- + 6 chars from `0123456789ABCDEFGHJKMNPQRSTVWXYZ`,
regex `^BM-[0-9A-HJKMNP-TV-Z]{6}$` matching the DB CHECK, `generateDonorCode`
+ `generateUniqueDonorCode` with collision retry),
`src/lib/donor-profile-validation.ts` (zod schemas: blood-group enum, past
DOB, paired lat/lng range-checked, last-known location),
`src/servers/user.ts` (`getDonorProfile`, `updateDonorProfile`,
`saveDonorProfile` for name + profile upsert with code generation and P2002
collision retry, `updateLastKnownLocation` — all behind the issue-04 consent
gate), rebuilt `/donor/profile` client (blood-group grid, DOB, address/state/
LGA, home pin with use-my-location + find-from-address via
`geocodeAddressAction`, availability switch, donor-code card with copy,
verification badge, unverified screening explainer, no-code/no-pin empty
states), `useLastKnownLocation` + `LastKnownLocationUpdater` mounted in the
donor layout (only pushes when geolocation permission is already granted),
`hasIncompleteProfile` repointed at the real `DonorProfile` fields, and
`tests/donor-profile.test.ts` (format, alphabet, batch uniqueness, collision
retry, validation, DB persistence incl. code stability on edit — 14 passing).
"App opens with permission" means Route Handlers + Server Actions for the
endpoint and the donor layout mount for the call; pages stay browsable for
unverified donors.

## Blocked by

- [03 Walking skeleton: standalone backend, baseline schema, donor sign-up and sign-in](03-walking-skeleton.md)
- [04 NDPR consent gate](04-ndpr-consent-gate.md)
