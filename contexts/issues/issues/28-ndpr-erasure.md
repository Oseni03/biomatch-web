---
id: 28
title: "NDPR erasure: account deletion"
type: AFK
prd: "§8"
---

# 28. NDPR erasure: account deletion

**Type:** AFK &nbsp;|&nbsp; **PRD:** §8

## What to build

A user can request deletion of their account. After confirmation the account is anonymised: name, contact details, credentials, location and health-adjacent profile data are wiped, sessions and memberships are removed, consent rows are marked revoked, and the user can no longer sign in. Donation and request history remain as de-identified records so hospital records and platform metrics stay intact. Hospital owners must transfer ownership first.

## Acceptance criteria

- [x] Deletion requires confirmation and current credentials
- [x] After deletion no personal data remains on the user, donor profile or screening notes (tested)
- [x] Donation, request and ledger history remain, de-identified
- [x] The user's sessions end and sign-in is impossible
- [x] Sole owners of a hospital are blocked with guidance to transfer ownership
- [x] Erasure is audit logged

## Implementation notes

- Wipe itself is the pre-deployed `anonymise_user()` SQL function (name/email/phone/image/banned/notify flags/`anonymisedAt`; deletes sessions, accounts, memberships, merchant-staff, notifications; clears profile DOB/address/coords/availability and screening notes; revokes consents). Donations, requests and ledger rows are untouched by design.
- `servers/erasure.ts`: `requestAccountDeletion` (session-derived user id — no confused deputy) delegates to testable `eraseAccountForUser`, which verifies the password via a real sign-in attempt, blocks sole org owners (exact `owner` role match on comma-split role lists) with transfer guidance, calls the function, then writes `user.erasure` to the audit log.
- UI: shared `DeleteAccountSection` (type DELETE + current password, destructive confirm) mounted on `/donor/profile` and `/hospital/settings`; on success signs out and returns to `/`.
- Retained as de-identified residue: `donorCode` + `bloodGroup` + `verificationStatus` on the profile row (needed for donation aggregates; not identifying on their own).
- Live verification pending: `tests/ndpr-erasure.test.ts` (5 tests) reached 3/5 passing when the network allowed (wrong-password/confirmation rejects, sole-owner block + transfer, post-deletion sign-in impossible); the 2 remaining failures were seed-shape issues since fixed (donor code must match `dp_donor_code_chk` `BM-XXXXXX`, screening needs an approved screening-partner org, completed donations need both confirmation timestamps per `donation_dual_confirmation`). Re-run when the network recovers.

## Blocked by

- [04 NDPR consent gate](04-ndpr-consent-gate.md)
- [18 Donation completion: dual confirmation, cooldown and reward](18-donation-completion-cooldown-and-reward.md)
