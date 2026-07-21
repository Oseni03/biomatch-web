## Parent

UI/UX + debugging report (grilling session, 2026-07-21) — see CLAUDE.md. Builds on the merged donor list from issue #40.

## What to build

Stakeholder feedback: clicking a donor in the donor list should expand to show "this person has donated before" plus a brief history. Today `User` only has a single `lastDonationDate` scalar — no per-donation records exist anywhere in the schema (`Wallet.lifetimeDonations` is a running count, not a history).

Resolved during grilling: build the real feature, not a fake/placeholder using existing fields.

Add a `Donation` model (`prisma/schema.prisma`):
- `id`, `donorId` (→ `User`), `hospitalBankId` (→ `HospitalBank`, nullable if donation wasn't tied to a specific hospital request), `bloodGroup`, `donatedAt`, `emergencyRequestId` (nullable, → `EmergencyRequest` if this donation fulfilled a specific alert)

Write a `Donation` row wherever a donation is currently confirmed/recorded. There are two existing write sites in `src/servers/emergency.ts` that update `lastDonationDate`/`lifetimeDonations` together (lines ~40-60 and ~675-700) — add the `Donation` insert in the same transaction at both. Do not change what already updates `lastDonationDate`/`lifetimeDonations` — this is additive.

On the merged donor list (issue #40), add a click-to-expand row showing the donor's donation history (date, blood group, which hospital/request if known), ordered most-recent-first.

## Acceptance criteria

- [ ] `Donation` model added via migration
- [ ] Existing donation-confirmation code path writes a `Donation` record (find and confirm the actual write path first — don't assume its location)
- [ ] `lastDonationDate`/`lifetimeDonations` updates unchanged (additive only)
- [ ] Donor list row expands on click to show donation history
- [ ] Donors with no donation history show "No donations yet" rather than an empty/broken expand

## Blocked by

#40 (donor list merge) — the expand affordance lives on the merged page
