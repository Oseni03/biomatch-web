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

- [ ] Accept succeeds only for matched, eligible donors (verified, unrestricted, out of cooldown); server enforced
- [ ] Concurrency test: many simultaneous accepts never exceed units required
- [ ] When units are met the request moves to fulfilled and other matches become filled with a clear donor-facing message
- [ ] Withdrawing an accepted match decrements accepted units and reopens the request
- [ ] Hospital receives an in-app notification when a donor accepts
- [ ] Donor View lists matched donors with response status; contact details are limited to what the hospital needs and only after acceptance
- [ ] A pending donation record is created on acceptance
- [ ] Empty states for every new screen are designed and implemented (required by the PRD) (no responses yet)

## Blocked by

- [12 Create blood request and match donors (in-app)](12-create-request-and-match-donors.md)
