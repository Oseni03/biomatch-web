## Parent

Codebase optimization & page-decomposition audit (2026-07-19) — see CLAUDE.md.

## What to build

`app/donor/history/page.tsx` (322 lines) inlines the eligibility banner (extract as shared `EligibilityBanner` per issue #38), a 4-tile stats grid, a local-demand card, and a donation-history table with hand-rolled pagination (use the shared pagination component from issue #37). Extract `DonationStatsGrid` and `LocalDemandCard` into `components/donor/`, and `DonationHistoryTable` using the shared pagination component.

## Acceptance criteria

- [ ] `DonationStatsGrid` extracted
- [ ] `LocalDemandCard` extracted
- [ ] `DonationHistoryTable` extracted, using the shared pagination component
- [ ] Page uses the shared `EligibilityBanner`
- [ ] No behavior change

## Blocked by

None — naturally follows #37 and #38 but not strictly blocked by either
