## Parent

Donor Eligibility & Screening Rework grilling session (2026-07-24) — see CLAUDE.md conversation history. Fourth of 4 tickets (58-61).

## What to build

Give donors a way to nudge the hospital if staff forget to finalize a donation — a soft reminder, not a gate. Add a nullable `donorConfirmedAt` timestamp on `EmergencyAlert`, settable by the donor while the alert is at `arrived`.

Today the donor's alert card shows a static "Fulfilled" badge for both `arrived` and `completed` states, with no action available. Split this: at `arrived` (not yet `completed`), show an "I Confirm I Donated" action instead of the static badge; once the donor taps it, show a "Waiting for hospital confirmation" state. `completed` alerts keep the existing "Fulfilled" display unchanged.

On the hospital side, add a persistent list — visually consistent with the existing pending-staff-invitations list pattern — surfacing alerts where `donorConfirmedAt` is set but staff haven't yet called `confirmDonation()`. This is purely informational: donor confirmation must never block or be required for `confirmDonation()` to succeed. Hospital staff can confirm a donation with or without the donor having confirmed first.

## Acceptance criteria

- [ ] `EmergencyAlert` gains nullable `donorConfirmedAt DateTime?`, settable by the donor only while status is `arrived`
- [ ] Donor alert card shows "I Confirm I Donated" at `arrived` (replacing the static "Fulfilled" badge for that specific stage); after confirming, shows a "Waiting for hospital confirmation" state
- [ ] `completed` alerts are unaffected — still show "Fulfilled"
- [ ] Hospital dashboard shows a persistent list of alerts awaiting hospital confirmation (`donorConfirmedAt` set, status still `arrived`), styled consistently with the existing pending-invitations list
- [ ] `confirmDonation()` behavior is unchanged by this ticket — works identically with or without `donorConfirmedAt` set

## Blocked by

None — can start immediately.
