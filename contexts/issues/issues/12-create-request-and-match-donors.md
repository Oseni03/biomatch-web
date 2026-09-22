---
id: 12
title: "Create blood request and match donors (in-app)"
type: AFK
prd: "§5.3, 7, 4.3"
---

# 12. Create blood request and match donors (in-app)

**Type:** AFK &nbsp;|&nbsp; **PRD:** §5.3, 7, 4.3

## What to build

An authorised member of an approved hospital creates a blood request: blood group needed, units required and location (defaulting to the hospital's location). All requests are urgent; there is no urgency tiering. Patient identity is never collected for donors; an optional private internal reference stays hospital-side.

On creation the backend finds every eligible donor and notifies them all at once: blood group compatible, verified, not restricted, available, out of cooldown, not banned, within the starting radius. Distance uses the last-known location if recent, otherwise the home pin. Phone verification does NOT affect matching. Each match is recorded and an in-app notification is created. Donors get a Requests Nearby list and a Notification Inbox; both show only blood type needed and hospital name and location.

## Acceptance criteria

- [x] Only approved hospitals and members with the create-request permission can create requests (tested)
- [x] Matching honours compatibility, verification, restriction, availability, cooldown and radius, and prefers fresh last-known location over the home pin
- [x] Donors without a verified phone are matched and receive the in-app notification
- [x] One match record per donor per request; all matched donors are notified simultaneously
- [x] Requests Nearby list and Notification Inbox screens work with read/unread state
- [x] API payloads to donors never contain patient or internal hospital fields (tested)
- [x] Unit tests cover compatibility, distance, freshness, cooldown and exclusion rules
- [x] The hospital sees the created request with the number of donors notified
- [x] Empty states for every new screen are designed and implemented (required by the PRD) (no requests nearby, empty inbox)

## Implementation (2026-09-22)

- `src/lib/config.ts`: tunable backend config (start/max/step radii,
  escalation window, location freshness, cooldown, reward, voucher validity).
- `src/servers/matching.ts`: `findEligibleDonors()` — the Haversine raw-SQL
  recipe (compatibility join, verified/active/available/cooldown/ban filters,
  fresh-last-known-else-home, radius, excludes already-matched so re-runs are
  idempotent and only add new donors).
- `src/servers/requests.ts`: `createBloodRequest` (consent + approval +
  `bloodRequest:create`, hospital-defaulted location, private internal
  reference, escalation timer set), `matchDonorsForRequest` (match rows +
  simultaneous in-app notifications with blood type/hospital/location only),
  `getRequestsNearby` (donor-safe payload, key-tested), `getNotificationInbox` +
  `markNotificationRead`, `getBloodRequestSummary` (notified/accepted/declined
  counts, read-permission gated).
- UI: hospital emergency form + dashboard dialog rewritten to the new API (no
  urgency tiers — all requests urgent; no radius slider — config start radius
  with automatic escalation; internal-reference field); new donor
  Notification Inbox (`/donor/notifications`) and Requests Nearby
  (`/donor/responses`) with empty states; sidebar donor badge now counts real
  nearby requests. Replaced old-model clients deleted.
- Fixed `formatBloodGroup()` for the new `A_POS` enum keys (badges showed `A-`).
- `tests/helpers.ts`: ordered test cleanup (children before parents) after a
  cross-run isolation failure left stale matches in the dev DB; all suites
  migrated to it and the DB was cleaned.
- `tests/blood-requests.test.ts` (7 passing): 13-donor pool covering
  compatibility, distance, freshness/staleness, cooldown, unverified/failed,
  restricted, unavailable, banned, phone-less matching, wider-radius + never-
  twice, donor-safe keys, inbox read/unread, hospital summary.
- Issue 08 test updated to the real create path (approved creates with 0
  matches; pending/rejected still rejected).

## Blocked by

- [06 Donor profile: blood group, home pin, availability and donor code](06-donor-profile-and-donor-code.md)
- [09 Admin: hospital approval and management](09-admin-hospital-approval.md)
- [11 Donor screening recorded by partner hospital staff](11-donor-screening-by-donor-code.md)
