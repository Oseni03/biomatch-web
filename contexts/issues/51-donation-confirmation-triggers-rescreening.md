## Parent

Donor eligibility/verification grilling session (2026-07-22) — see CLAUDE.md. Fifth of 5 tickets (47-51).

## What to build

Re-screening is tied to donation events, not a separate expiry clock (ticket 47's design decision). The one existing real donation-confirmation write path is `confirmDonation()` in `servers/emergency.ts` (the `prisma.$transaction` that flips the alert to `completed`, sets `lastDonationDate`, and updates the wallet) — find and confirm this is still the current write path before changing it, don't assume.

In that same transaction, also open a fresh `pending` `DonorScreening` row for the donor (reusing ticket 48's creation mechanics), representing the re-test that accompanies this donation.

Because ticket 47's status derivation always reads the donor's *latest resolved* screening, opening this new `pending` row must not immediately drop the donor out of `verified` status — they keep their prior `passed` result (and stay matchable once their post-donation cooldown ends) until the new screening actually resolves. This matters specifically when lab turnaround outlasts the `ELIGIBILITY_DAYS` cooldown window.

## Acceptance criteria

- [ ] Confirming a donation opens a new `pending` `DonorScreening` for that donor in the same transaction
- [ ] The donor's `verificationStatus` remains `verified` (based on their prior resolved screening) while the new one is `pending`
- [ ] Existing `lastDonationDate`/`lifetimeDonations`/alert-completion behavior in `confirmDonation()` is unchanged — this is additive
- [ ] If the new screening later resolves to `failed`, the donor correctly drops out of matching from that point on

## Blocked by

47 (status derivation rule), 48 (screening creation path being reused)
