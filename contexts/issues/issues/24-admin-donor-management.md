---
id: 24
title: "Admin: donor management"
type: AFK
prd: "§4.4"
---

# 24. Admin: donor management

**Type:** AFK &nbsp;|&nbsp; **PRD:** §4.4

## What to build

The admin can list, search and filter donors, open a donor's details (verification status, donation count, restriction state), and flag or restrict a donor with a reason, and lift the restriction. A restricted donor stays active and can log in but is excluded from matching and cannot accept requests.

## Acceptance criteria

- [ ] List, search and filter donors by blood group, verification status and state
- [ ] Donor detail shows verification status, donations and restriction state
- [ ] Restricting requires a reason, is audit logged, and immediately removes the donor from matching (tested)
- [ ] Restricted donors can still log in and view their screens
- [ ] Lifting a restriction restores eligibility subject to other rules
- [ ] Empty states for every new screen are designed and implemented (required by the PRD)

## Blocked by

- [12 Create blood request and match donors (in-app)](12-create-request-and-match-donors.md)
