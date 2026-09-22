---
id: 14
title: "Decline notifies the next-closest donor"
type: AFK
prd: "§5.3"
---

# 14. Decline notifies the next-closest donor

**Type:** AFK &nbsp;|&nbsp; **PRD:** §5.3

## What to build

When a donor declines, the match is marked declined and the next-closest compatible, eligible donor who has not yet been notified for that request is matched and alerted. The search may reach slightly beyond the current radius up to the configured maximum. If no further donor exists, nothing happens and automatic escalation covers it later.

## Acceptance criteria

- [x] Declining marks the match declined and records the response time
- [x] Exactly one additional donor is matched and notified per decline, choosing the closest eligible unnotified donor
- [x] Donors already matched to the request are never notified twice
- [x] No error or duplicate notification when no candidates remain
- [x] Tests cover ordering by distance and the maximum radius

## Implementation (2026-09-22)

- `declineMatch()` in `src/servers/responses.ts`: notified-only (accepted
  donors withdraw instead), stamps `respondedAt`, then chains the closest
  candidate from `findEligibleDonors(requestId, MATCH_MAX_RADIUS_KM)` in the
  same transaction — one match + one `request.matched` notification.
  Already-matched exclusion comes from the matcher query, backed by
  `@@unique([requestId, donorId])` (a lost race resolves to `notifiedDonor:
  false`, never a duplicate). Re-declining returns the stored outcome
  without chaining again; audit `request_match.declined` records whether a
  replacement was notified.
- UI: Decline button on each Requests Nearby card (`useDeclineMatch`).
- `tests/decline-chain.test.ts` (5 passing): decline notifies the
  next-closest (15 km over 25 km); second decline chains in distance order;
  exhausted pool resolves cleanly with no new rows; re-decline does not
  chain; beyond-max donor never matched; wrong-donor decline rejected.

## Blocked by

- [13 Donor accepts with acceptances capped at units needed, plus hospital Donor View](13-donor-accept-with-unit-cap-and-donor-view.md)
