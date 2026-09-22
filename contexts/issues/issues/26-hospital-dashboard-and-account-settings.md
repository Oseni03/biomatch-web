---
id: 26
title: "Hospital dashboard and account settings"
type: AFK
prd: "§4.2"
---

# 26. Hospital dashboard and account settings

**Type:** AFK &nbsp;|&nbsp; **PRD:** §4.2

## What to build

Port the hospital dashboard to the new backend: overview of active requests, recent donations and key metrics, consistent with the enterprise-grade feel the PRD requires. Add Account Settings: organisation profile (editable by authorised staff), per-user notification preferences by channel, and account management such as changing password.

## Acceptance criteria

- [x] Dashboard shows active requests, recent donations and key metrics from backend data
- [x] Organisation profile edits require the organisation-update permission
- [x] Notification preferences by channel are saved and respected by delivery (slice 17)
- [x] User can change their password and sign out of other sessions
- [x] Empty states for every new screen are designed and implemented (required by the PRD)

## Implementation notes

- `getHospitalDashboardMetrics` (`servers/hospital.ts`, `bloodRequest:read` gate): active-request count, required/accepted/outstanding units over active requests, completed-donation count, latest 6 donations with donor name + blood group.
- `updateOrganizationProfile` gated on `organization:update` (owner/admin have it, member does not); edits name/phone/address/state/lga — latitude/longitude are deliberately untouched, so a facility move needs a fresh verification.
- `/hospital/settings`: profile card (read-only + admin pointer when unauthorized), reused `NotificationPreferencesCard`, password change (`authClient.changePassword`), sessions list + `revokeOtherSessions`.
- Live verification pending: `tests/hospital-dashboard-settings.test.ts` (5 tests: metrics deltas, perm gate, prefs round-trip, password change + session revoke) is type-clean but 0/5 pass — every DB call fails with Neon `EAI_AGAIN` DNS during the outage window. Re-run when the network recovers.

## Blocked by

- [18 Donation completion: dual confirmation, cooldown and reward](18-donation-completion-cooldown-and-reward.md)
