---
id: 13
title: "Donor accepts with acceptances capped at units needed, plus hospital Donor View"
type: AFK
prd: "§5.3, 4.2"
---

# 13. Donor accepts with acceptances capped at units needed, plus hospital Donor View

**Type:** AFK &nbsp;|&nbsp; **PRD:** §5.3, 4.2

## What to build

A matched donor taps a confirmation button in the app to accept. Acceptance is a single atomic operation that only succeeds while accepted units are below units required, so simultaneous accepts can never overfill a request. When the cap is reached the request becomes fulfilled and remaining waiting donors are told it is filled. An accepted donor can withdraw, which reopens the request. The hospital is notified in-app when a donor accepts, and a Donor View per request shows matched donors and their response status.

Accepting also creates a pending donation record used by the completion slice.

## Acceptance criteria

- [x] Accept succeeds only for matched, eligible donors (verified, unrestricted, out of cooldown); server enforced
- [x] Concurrency test: many simultaneous accepts never exceed units required
- [x] When units are met the request moves to fulfilled and other matches become filled with a clear donor-facing message
- [x] Withdrawing an accepted match decrements accepted units and reopens the request
- [x] Hospital receives an in-app notification when a donor accepts
- [x] Donor View lists matched donors with response status; contact details are limited to what the hospital needs and only after acceptance
- [x] A pending donation record is created on acceptance
- [x] Empty states for every new screen are designed and implemented (required by the PRD) (no responses yet)

## Implementation (2026-09-22)

- `src/servers/responses.ts`: `acceptMatch()` — eligibility re-check, then the
  atomic counter UPDATE (wins only while unitsAccepted < unitsRequired);
  winners get match=accepted + pending `Donation` + hospital notification,
  losers get match=filled + `request.filled` notification. Repeat accepts and
  late arrivals return the filled/accepted outcome instead of throwing.
  `withdrawMatch()` decrements, deletes the never-happened donation, reopens
  to active and flips filled matches back to notified (no re-notification).
  `getMyResponses()` and `getRequestDonorView()` (contact — name, code, phone —
  only for accepted/completed; waiting donors anonymous).
- Hospital staff notification goes to the creator plus owner/admin members.
- UI: Accept buttons on Requests Nearby, accepted-donations section with
  Withdraw, `/hospital/requests/[id]` detail (summary cards + Donor View with
  no-responses empty state).
- `tests/request-responses.test.ts` (6 passing): accept → counter/donation/
  notification; 3-way concurrent race caps at units with no overfill;
  withdraw reopens; ineligible/unmatched rejected; donor-view contact gating.
- Bug found by the race: early-exit paths threw instead of returning `filled`;
  fixed so donors always get the donor-facing outcome.

## Blocked by

- [12 Create blood request and match donors (in-app)](12-create-request-and-match-donors.md)
