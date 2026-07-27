## Parent

Donor eligibility/verification grilling session (2026-07-22) — see CLAUDE.md. First of 5 tickets (47-51) implementing "donors aren't matchable until tested and verified."

## What to build

Today `User` has no concept of medical verification — eligibility (`lib/eligibility.ts`, `matchDonors()` in `servers/emergency.ts`, `listDonors()` in `servers/user.ts`) is purely time-based (`ELIGIBILITY_DAYS` since `lastDonationDate`) plus `isActive`. This ticket adds the data foundation everything else in this feature builds on.

Add a `DonorScreening` model (`prisma/schema.prisma`):
- `id`, `donorId` (→ `User`), `hospitalId` (→ the hospital that performed the screening), `staffUserId` (→ the staff member who recorded it), `status` (`pending` | `passed` | `failed`), `screenedAt`, `resolvedAt` (nullable until the result comes back), `notes` (optional, free text — no per-disease breakdown; this app is not the system of record for clinical detail).
- No expiry field — re-screening is triggered by donation events (ticket 51), not a calendar.

Add a derived verification status usable wherever donor eligibility is checked. It must resolve to the donor's **latest resolved** screening's result (`passed` or `failed`), not simply the latest row — a newer `pending` re-screening in progress must not retroactively make an already-`passed` donor un-matchable. Donors with no `DonorScreening` rows at all resolve to `unverified`.

Migration must be additive only per AGENTS.md's Database Safety rules — no data-loss-risking changes. As part of the same migration/seed step, backfill every existing donor as `verified` (e.g. one synthetic resolved `passed` `DonorScreening` row per existing donor, or an equivalent grandfather mechanism) so no currently-active donor drops out of hospital matching the moment this ships.

## Acceptance criteria

- [ ] `DonorScreening` model added via an additive migration (no dropped/reset data)
- [ ] A shared helper/query resolves a donor's current verification status from their latest *resolved* screening, ignoring any newer in-flight `pending` row
- [ ] Donors with zero screening rows resolve to `unverified`
- [ ] Migration backfills all pre-existing donors as `verified` as of ship day
- [ ] No changes to existing `ELIGIBILITY_DAYS`/`isActive` logic — this is additive

## Blocked by

None — can start immediately
