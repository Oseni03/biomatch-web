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

- [ ] Escalation widens the radius by the configured step and stops at the maximum
- [ ] Only newly eligible donors are matched and notified; no duplicates
- [ ] Fulfilled, closed and cancelled requests are never escalated
- [ ] Running the job twice or concurrently produces no duplicate matches (tested)
- [ ] Tests use a controllable clock to cover timing and the maximum radius
- [ ] The hospital sees the request's current search radius

## Blocked by

- [13 Donor accepts with acceptances capped at units needed, plus hospital Donor View](13-donor-accept-with-unit-cap-and-donor-view.md)
