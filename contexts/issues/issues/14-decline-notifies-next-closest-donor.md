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

- [ ] Declining marks the match declined and records the response time
- [ ] Exactly one additional donor is matched and notified per decline, choosing the closest eligible unnotified donor
- [ ] Donors already matched to the request are never notified twice
- [ ] No error or duplicate notification when no candidates remain
- [ ] Tests cover ordering by distance and the maximum radius

## Blocked by

- [13 Donor accepts with acceptances capped at units needed, plus hospital Donor View](13-donor-accept-with-unit-cap-and-donor-view.md)
