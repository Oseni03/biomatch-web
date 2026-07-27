## Parent

Donor Eligibility & Screening Rework grilling session (2026-07-24) — see CLAUDE.md conversation history. First of 4 tickets (58-61). Sequel to the donor verification/eligibility work in issues 47-51.

## What to build

`matchDonors()` in `servers/emergency.ts` currently excludes any donor without a *passed* screening (`getVerifiedDonorIds()`). Change this to exclude only donors with **zero screening history** — no `DonorScreening` row of any status at all. Donors who have been screened before, even if their most recent result was a `failed`, remain in the dispatch pool (screening failure handling with lasting consequences is ticket 60's job, not this one).

Also replace the 56-day (`ELIGIBILITY_DAYS`) cooldown with a **3 calendar month** cooldown (not a flat 90-day approximation — use calendar-month arithmetic so month-length variance is handled correctly), consumed from `lib/eligibility.ts` by both matching and donor-facing displays.

UI: the donor-facing eligibility/cooldown displays (eligibility banner, deferral status card) must reflect the new 3-month interval in their days-remaining math. The donor-facing verification status badge copy should be updated to clarify that having *zero* screening history — not merely an unpassed one — is what blocks alert dispatch now.

Explicitly out of scope: `listDonors({ eligibleOnly })` in `servers/user.ts` (the hospital donor directory browse filter) is a separate read path from emergency dispatch and is not being changed here — leave its existing `getVerifiedDonorIds()` filter as-is.

## Acceptance criteria

- [ ] `matchDonors()` excludes only donors with zero `DonorScreening` rows of any status; donors with any screening history (including a past `failed`) remain eligible for dispatch
- [ ] The 56-day cooldown is replaced by a 3-calendar-month cooldown in `lib/eligibility.ts`, consumed by both `matchDonors()` and donor-facing eligibility UI
- [ ] Donor eligibility banner / deferral status card correctly reflect the 3-month interval
- [ ] Donor verification status banner copy distinguishes "never screened" from "screened but not currently passed"
- [ ] `listDonors({ eligibleOnly })` in `user.ts` is unchanged — confirmed still filtering on passed-screening status, not touched by this ticket

## Blocked by

None — can start immediately.
