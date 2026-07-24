## Parent

Donor Eligibility & Screening Rework grilling session (2026-07-24) — see CLAUDE.md conversation history. Third of 4 tickets (58-61).

## What to build

Give hospital staff a way to defer or blacklist a donor when a screening fails, with lasting consequences for that donor's future matching — not just a flat one-time outcome.

Add a new terminal `AlertStatus` value (`screening_failed`) for when an on-site screening tied to an alert (from ticket 59) resolves `failed`. Add `deferredUntil DateTime?` and `blacklistedAt DateTime?` fields to `User`. Wherever a screening is resolved as `failed` — both the alert-scoped flow from ticket 59 and the existing standalone walk-in donor-screening panel — staff choose one of: defer the donor until a specific date, or blacklist them permanently. When resolved via the alert-scoped flow, the linked `EmergencyAlert` moves to `screening_failed`; this must not affect other donors' alerts on the same request or flip the shared `EmergencyRequest` status (alerts are already donor-scoped in every query — confirm this isolation holds).

`matchDonors()` must exclude donors who are blacklisted (`blacklistedAt` set) or currently within a `deferredUntil` window from all future dispatch. A blacklisted donor's own alerts feed must show no alerts and display a banner explaining why, rather than silently rendering empty. The donor directory / screening panel should show a deferred/blacklisted badge on affected donors so staff can see this status at a glance.

## Acceptance criteria

- [ ] New `AlertStatus.screening_failed` added
- [ ] `User` gains `deferredUntil DateTime?` and `blacklistedAt DateTime?`
- [ ] Resolving a screening as `failed` (alert-scoped flow and the standalone screening panel) prompts staff to choose defer-until-date or blacklist
- [ ] Alert-scoped failure moves that `EmergencyAlert` to `screening_failed` without affecting other donors' alerts or the parent `EmergencyRequest` status
- [ ] `matchDonors()` excludes blacklisted donors and donors currently within their `deferredUntil` window
- [ ] A blacklisted donor sees no alerts in their own feed, with a banner explaining why
- [ ] Donor directory / screening panel displays a deferred/blacklisted badge on affected donors

## Blocked by

59 (needs the alert-linked screening flow to exist — this is its failure branch).
