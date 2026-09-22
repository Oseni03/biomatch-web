---
id: 16
title: "Edit, cancel and close requests; Active Requests and History"
type: AFK
prd: "§4.2, 7"
---

# 16. Edit, cancel and close requests; Active Requests and History

**Type:** AFK &nbsp;|&nbsp; **PRD:** §4.2, 7

## What to build

Hospital staff with the right permissions manage requests after submission. Active Requests lists open requests and lets staff edit them, cancel them or close them. A request stays active until the hospital manually closes it. Closing or cancelling stops further notifications and expires pending matches, and donors matched to the request see the update. History shows all past requests with their outcomes.

## Acceptance criteria

- [x] Active Requests list shows open requests with status, units accepted and radius
- [x] Edit is allowed while open; lowering units below the accepted count is rejected with a clear message
- [x] Cancel and close stop notifications and escalation and expire pending matches
- [x] Donors with pending matches see that the request is no longer open
- [x] History lists closed, cancelled and fulfilled requests with outcomes
- [x] All actions are permission gated and audit logged
- [x] Empty states for every new screen are designed and implemented (required by the PRD) (no active requests, no history)

## Implementation (2026-09-22)

- `src/servers/requests.ts`: `getActiveRequests()` (open only, with units,
  radius, notified count, paginated) and `getRequestHistory()` (fulfilled /
  closed / cancelled, `history.read` gate). `updateBloodRequest()` edits
  units/location/reference on active requests only and rejects lowering
  units below accepted (`bloodRequest.update` gate). `cancelBloodRequest()`
  / `closeBloodRequest()` share `settleRequest()` (`bloodRequest.close`
  gate): flips to cancelled/closed with `closedAt`, clears the escalation
  timer, expires notified+filled matches, cancels accepted matches and
  their pending donations, notifies every matched donor
  (`request.cancelled` / `request.closed`), audit logs all three actions.
- Donors see the update three ways: the request drops out of Requests
  Nearby (active-only query), matched donors get a push-style inbox
  notification, accepted donors lose the pending donation.
- UI: `/hospital/requests` Active list (edit dialog, Close, confirm-gated
  Cancel, empty state) + `/hospital/requests/history` (outcome tags,
  empty state), sidebar "Active Requests" item, hooks in
  `use-hospital-requests.ts`.
- `tests/request-manage.test.ts` (5 passing): active list content; guard
  message after 2 accepts; viewer (`member`, no domain perms) blocked with
  "Not authorized"; cancel flips accepted→cancelled / notified→expired /
  donation→cancelled + notifies all 3 donors + clears timer + moves to
  history; close + edit-after-close rejected.

## Blocked by

- [13 Donor accepts with acceptances capped at units needed, plus hospital Donor View](13-donor-accept-with-unit-cap-and-donor-view.md)
