## Parent

Donor eligibility/verification grilling session (2026-07-22) — see CLAUDE.md. Third of 5 tickets (47-51). Independent of ticket 48 — this only needs the status field from 47, not the staff UI that produces it, so it can be built/verified in parallel (e.g. against seeded/manually-set statuses).

## What to build

Currently `matchDonors()` (`servers/emergency.ts`) and `listDonors()`'s `eligibleOnly` filter (`servers/user.ts`) select donors based only on `role: "donor"`, `isActive`, and the `ELIGIBILITY_DAYS` cooldown on `lastDonationDate`. Add the verification gate on top of these, additively:

- `matchDonors()` must exclude any donor whose current verification status (per ticket 47's derivation) is not `verified` — an unverified, pending, or failed donor must never be dispatched an emergency alert.
- `listDonors()`'s `eligibleOnly` filter must apply the same gate.
- This is purely a `where`-clause addition — do not change the existing `isActive`/cooldown logic, and do not restrict anything else about the donor's app access (per the grilling decision: unverified donors keep full dashboard/profile/wallet access; the only effect is invisibility to hospital matching).

## Acceptance criteria

- [ ] `matchDonors()` excludes donors who are not currently `verified`
- [ ] `listDonors()` `eligibleOnly` excludes donors who are not currently `verified`
- [ ] Existing `isActive` and `ELIGIBILITY_DAYS` cooldown behavior is unchanged
- [ ] An unverified donor can still log in, view their dashboard, and edit their profile — only matching/list visibility is affected

## Blocked by

47 (needs the verification status to filter on)
