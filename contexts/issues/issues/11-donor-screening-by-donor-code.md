---
id: 11
title: "Donor screening recorded by partner hospital staff"
type: AFK
prd: "§5.2"
---

# 11. Donor screening recorded by partner hospital staff

**Type:** AFK &nbsp;|&nbsp; **PRD:** §5.2

## What to build

The admin marks approved hospitals as screening partners. Staff at a partner hospital with the record-screening permission enter a donor's code, see the donor's name, blood group and current status, and record a passed or failed result with optional notes. A database trigger rejects screenings from non-partner hospitals and syncs the donor's verification status (latest screening wins, so a failed donor can be re-screened). Verified donors enter the matching pool; failed donors keep an active account but receive no alerts. Self-declared or uploaded documents are never accepted.

## Acceptance criteria

- [x] Admin can toggle the screening-partner flag on an approved hospital
- [x] Staff with the permission can look up a donor by donor code; unknown codes return a generic not-found; lookups are rate limited
- [x] Passed and failed results can be recorded with notes; the donor's verification status updates accordingly
- [x] Non-partner hospitals and staff without the permission are rejected (tested, including the database trigger)
- [x] Re-screening a failed donor is allowed; the latest result wins
- [x] The donor's profile shows the updated status
- [x] Each screening is audit logged
- [x] Empty states for every new screen are designed and implemented (required by the PRD)

## Implementation (2026-09-22)

- `src/servers/screening.ts`: `lookupDonorByCode` (partner + `recordScreening`
  permission gate, audit-backed rate limit — 60 lookups/10 min, generic
  not-found for unknown AND malformed codes, returns name/blood group/status),
  `recordScreening` (passed/failed + notes, trigger maps clean errors, returns
  the synced status), `listRecentScreenings`, `checkScreeningLookupRateLimit`.
  The DB trigger (`sync_donor_verification`) syncs latest-wins status and
  rejects non-partner writes even on direct inserts.
- `setScreeningPartner()` in `src/servers/admin.ts` (approved-only to enable,
  audit logged) + `PartnerToggle` on the admin hospital detail page.
- UI: `/hospital/screening` (lookup → donor card → pass/fail + recent list;
  no-lookup/no-screenings empty states, no-permission state) + sidebar nav.
  Donor profile already displayed `verificationStatus` (issue 06) — now fed by
  real screenings.
- `tests/donor-screening.test.ts` (7 passing): admin partner flow (incl.
  pending blocked), permission rejection, generic not-found, pass→fail→pass
  latest-wins with profile + recent + audit asserts, trigger rejection on
  direct insert, rate limiting.

## Blocked by

- [06 Donor profile: blood group, home pin, availability and donor code](06-donor-profile-and-donor-code.md)
- [09 Admin: hospital approval and management](09-admin-hospital-approval.md)
- [10 Hospital team and role-based access control](10-hospital-team-and-rbac.md)
