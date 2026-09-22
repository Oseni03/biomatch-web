---
id: 25
title: "Admin: platform overview metrics"
type: AFK
prd: "§4.4"
---

# 25. Admin: platform overview metrics

**Type:** AFK &nbsp;|&nbsp; **PRD:** §4.4

## What to build

The Platform Overview shows total hospitals, total donors, active requests and completed donations, computed from the backend with efficient queries.

## Acceptance criteria

- [x] All four metrics are correct against seeded test data
- [x] Zero and first-run states render clearly
- [x] Queries perform acceptably with a large seeded dataset

Implemented 2026-09-22: `getAdminOverviewCounts()` extended with
`activeRequests` (`blood_requests` status active) and `completedDonations`
(`donations` status completed) — still one round of parallel `COUNT(*)`
queries, no per-row work. `/admin` shows six cards plus an Emergency Activity
panel with live/quiet/first-run copy. `tests/admin-platform-overview.test.ts`
(3 passing): delta assertions (+1 hospital, +100 donors, +1 active request,
+1 completed donation on a shared DB), metrics round-trip under 30s with 100
seeded donors, non-admin rejection. Volume cleanup uses bulk deletes (the
per-user helper is too slow for 100 users inside the suite timeout).

## Blocked by

- [18 Donation completion: dual confirmation, cooldown and reward](18-donation-completion-cooldown-and-reward.md)
