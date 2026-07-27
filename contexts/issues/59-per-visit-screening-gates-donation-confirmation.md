## Parent

Donor Eligibility & Screening Rework grilling session (2026-07-24) — see CLAUDE.md conversation history. Second of 4 tickets (58-61).

## What to build

Screening becomes a required, per-visit step tied to the specific `EmergencyAlert`, not a one-time or post-hoc check. Add a nullable `alertId` FK on `DonorScreening` pointing at `EmergencyAlert`.

At the `arrived` stage, hospital staff need a way to screen *this specific donor for this specific visit*. Reuse the existing create/resolve screening mechanics already built for the walk-in donor-screening panel (`createScreening`/`resolveScreening`), extended to accept an optional `alertId`. The hospital arrived-stage list gets a state-dependent action on each row: "Screen Donor" when no screening exists yet for this alert, becoming "Confirm Donation" (enabled) once that screening resolves `passed`.

`confirmDonation()` must require a `passed` screening linked to this `alertId` before it will complete — this reverses the current behavior in `servers/emergency.ts`, where confirming a donation completes first and only afterward opens a new `pending` re-test screening (introduced in issue 51). That auto-open-after-confirm behavior is removed; screening now happens *before* confirmation is even possible, every visit, not after.

## Acceptance criteria

- [ ] `DonorScreening` gains a nullable `alertId String? @db.Uuid` FK to `EmergencyAlert`
- [ ] Hospital arrived-stage list shows "Screen Donor" when no screening exists for that alert yet; "Confirm Donation" once a `passed` screening linked to that alert exists
- [ ] `confirmDonation()` throws/rejects unless a `passed` `DonorScreening` linked to this `alertId` exists
- [ ] The issue-51 behavior of auto-opening a `pending` re-test screening after confirmation is removed
- [ ] Existing `lastDonationDate` / wallet points / alert-completion behavior in `confirmDonation()` is otherwise unchanged

## Blocked by

None — can start immediately, independent of 58.
