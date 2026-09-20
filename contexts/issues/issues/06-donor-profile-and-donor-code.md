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

- [ ] Donor can create and edit profile fields; invalid coordinates are rejected
- [ ] Availability toggle persists and is visible to the donor
- [ ] A unique donor code in the agreed format is generated at profile creation and displayed with a copy action
- [ ] Verification status badge reflects the stored status; new donors show unverified
- [ ] Last-known location update endpoint exists and is called when the app opens with permission
- [ ] Unverified donors can browse but the UI explains they need physical screening at a partner hospital
- [ ] Tests cover code uniqueness and format
- [ ] Empty states for every new screen are designed and implemented (required by the PRD)

## Blocked by

- [03 Walking skeleton: standalone backend, baseline schema, donor sign-up and sign-in](03-walking-skeleton.md)
- [04 NDPR consent gate](04-ndpr-consent-gate.md)
