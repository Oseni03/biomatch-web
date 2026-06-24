# PRD-Driven Issue Tracker

These 11 vertical-slice issues were derived from `BIO_MATCH_PRD.md` via the `to-issues` process. Each slice cuts through all integration layers (schema, API, UI, tests) and is independently demoable.

## Issue Map

| # | Type | Title | Blocked By | HITL/AFK | Status |
|---|---|---|---|---|---|---|
| 01 | AFK | Emergency Request + Matching Engine | — | AFK | ✅ |
| 02 | AFK | Donor Alert & Response (In-App) | 01 | AFK | |
| 03 | AFK | Radius Expansion | 02 | AFK | |
| 04 | AFK | Hospital Live Request Status Panel | 02 | AFK | |
| 05 | HITL | Notification Delivery (Push + SMS) | 01 | HITL | |
| 06 | AFK | Donation Confirmation | 02 | AFK | |
| 07 | HITL | HMO Incentive Integration | 06 | HITL | |
| 08 | AFK | Donor Registration Enhancements | — | AFK | ✅ |
| 09 | AFK | Donor History & Impact Dashboard | 06, 08 | AFK | |
| 10 | HITL | Hospital Admin Features | 04, 06 | HITL | |
| 11 | HITL | Institutional Partner Management | 08 | HITL | |

## HITL Decisions Required

These issues require human input before an AFK agent can implement:

- **Issue 05**: Push channel choice (browser vs FCM vs APNs), SMS provider (Twilio/Africa's Talking/Termii), "opened" tracking mechanism
- **Issue 07**: HMO partner API contract, coverage tier details, enrollment data requirements
- **Issue 10**: Hospital staff role definitions, analytics KPI selection, export format
- **Issue 11**: Partner onboarding flow, invitation method, dashboard access model

## Dependencies Graph

```
01 ──> 02 ──> 03
 │      │
 │      ├──> 04
 │      │
 │      └──> 06 ──> 07
 │
 └──> 05

08 ──> 09
 │      │
 │      └──> 11

04 + 06 ──> 10
```

## User Stories Coverage Map

| User Story | Issue(s) |
|---|---|
| 1, 2 — Hospital creates emergency request | 01 |
| 3 — Live funnel status | 04 |
| 4 — Auto radius expansion | 03 |
| 5 — En route tracking | 02, 04 |
| 6 — Emergency history | 04 |
| 7 — Donor directory | *(Phase 2 — separate)* |
| 8, 18 — Donor registration + preferences | 08 |
| 9 — Push notification | 05 |
| 10 — SMS fallback | 05 |
| 11 — One-tap accept/decline | 02 |
| 12 — En route status | 02 |
| 13 — Re-eligibility notification | 09 |
| 14 — Monthly local demand | 09 |
| 15 — Donation history | 09 |
| 16 — HMO after 1st donation | 07 |
| 17 — HMO upgrade after 3rd | 07 |
| 19 — Staff account management | 10 |
| 20, 21 — Analytics + export | 10 |
| 22, 23 — Institutional partners | 11 |

## Implementation Order

Recommended implementation order:

1. ~~Issue 08~~ ✅ (no blockers, enables location matching)
2. ~~Issue 01~~ ✅ (foundation of emergency flow)
3. Issue 02 (donor response — unlocks all downstream)
4. Issue 03 (radius expansion — depends on 02)
5. Issue 04 (status panel — depends on 02)
6. Issue 06 (donation confirmation — depends on 02)
7. Issue 05 (notifications — depends on 01, can parallel with 02-06)
8. Issue 07 (HMO — depends on 06)
9. Issue 09 (donor history — depends on 06, 08)
10. Issue 10 (admin — depends on 04, 06, can parallel with 09)
11. Issue 11 (partners — depends on 08)
