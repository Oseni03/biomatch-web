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

- [ ] Active Requests list shows open requests with status, units accepted and radius
- [ ] Edit is allowed while open; lowering units below the accepted count is rejected with a clear message
- [ ] Cancel and close stop notifications and escalation and expire pending matches
- [ ] Donors with pending matches see that the request is no longer open
- [ ] History lists closed, cancelled and fulfilled requests with outcomes
- [ ] All actions are permission gated and audit logged
- [ ] Empty states for every new screen are designed and implemented (required by the PRD) (no active requests, no history)

## Blocked by

- [13 Donor accepts with acceptances capped at units needed, plus hospital Donor View](13-donor-accept-with-unit-cap-and-donor-view.md)
