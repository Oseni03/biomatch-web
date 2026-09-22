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

- [x] List, search and filter donors by blood group, verification status and state
- [x] Donor detail shows verification status, donations and restriction state
- [x] Restricting requires a reason, is audit logged, and immediately removes the donor from matching (tested)
- [x] Restricted donors can still log in and view their screens
- [x] Lifting a restriction restores eligibility subject to other rules
- [x] Empty states for every new screen are designed and implemented (required by the PRD)

Implemented 2026-09-22: `listDonors` (name/email/code search + blood group /
verification / state / account-status filters + pagination), `getDonorDetail`
(verification, donation counts, recent donations, restriction state + admin
name), `restrictDonor` (reason required, sets restricted + reason/by/at, audit
`donor.restrict`) and `liftDonorRestriction` (audit `donor.lift_restriction`)
in `servers/admin.ts`; `/admin/donors` + `/admin/donors/[id]` pages, sidebar
Donors item, `tests/admin-donor-management.test.ts` (7 passing: search/filter
matrix, detail, reason-required + audit + real-path matching exclusion via
`createBloodRequest` matched counts, restricted read access intact, lift
restores matching, non-admin/unknown-donor rejections). Restriction rides the
existing `donorStatus` machinery — matching SQL and `acceptMatch` already
exclude non-active donors, so the flip takes effect immediately.

## Blocked by

- [12 Create blood request and match donors (in-app)](12-create-request-and-match-donors.md)
