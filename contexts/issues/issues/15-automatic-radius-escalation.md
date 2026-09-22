---
id: 15
title: "Automatic escalation to a wider radius"
type: AFK
prd: "§5.3, 7"
---

# 15. Automatic escalation to a wider radius

**Type:** AFK &nbsp;|&nbsp; **PRD:** §5.3, 7

## What to build

A scheduled job (approach decided in slice 01) finds active requests that still need units and have passed their escalation time with no sufficient response. It widens the radius by the configured step up to the maximum, matches and notifies only donors not already matched, and resets the timer. Radii and the response window come from backend config. The job is idempotent and safe to run repeatedly or concurrently.

## Acceptance criteria

- [x] Escalation widens the radius by the configured step and stops at the maximum
- [x] Only newly eligible donors are matched and notified; no duplicates
- [x] Fulfilled, closed and cancelled requests are never escalated
- [x] Running the job twice or concurrently produces no duplicate matches (tested)
- [x] Tests use a controllable clock to cover timing and the maximum radius
- [x] The hospital sees the request's current search radius

## Implementation (2026-09-22)

- `escalateDueRequests(now = new Date())` in `src/servers/requests.ts`: claims
  each due active, still-unfilled request with a guarded `updateMany`
  (status active, timer elapsed, units still needed) so overlapping runs
  escalate it exactly once. Widens by `MATCH_ESCALATION_STEP_KM` up to
  `MATCH_MAX_RADIUS_KM`, bumps `escalationLevel`, resets `nextEscalationAt`
  by `MATCH_ESCALATION_WINDOW_MINUTES`; reaching the max clears the timer.
  New donors come from the idempotent `matchDonorsForRequest`.
- Cron entrypoint `GET /api/cron/escalate` (bearer `CRON_SECRET`), scheduled
  every 10 minutes in `vercel.json` per ADR decision 005 (cron polling, no
  queue). Needs `CRON_SECRET` set in the host env.
- Hospital sees the radius on `/hospital/requests/[id]` (issue 13 StatCard).
- `tests/request-escalation.test.ts` (6 passing, injectable clock): step
  widen + new-only matching + timer reset; pre-timer repeats no-op;
  concurrent double-run escalates once with no dupes; 45→50 stops at max
  with timer cleared; fulfilled and cancelled never escalated (cancelled
  needs `closedAt` per `br_closed_consistency`).

## Blocked by

- [13 Donor accepts with acceptances capped at units needed, plus hospital Donor View](13-donor-accept-with-unit-cap-and-donor-view.md)
