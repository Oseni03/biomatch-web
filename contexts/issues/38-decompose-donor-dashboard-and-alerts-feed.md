## Parent

Codebase optimization & page-decomposition audit (2026-07-19) — see CLAUDE.md.

## What to build

`app/donor/page.tsx` (390 lines) orchestrates 5 data sources and 6 mutation-style handlers (`handleRespond`, `handleDecline`, `handleMarkEnRoute`, `handleMarkArrived`, `handleManualComplete`, `handleSaveSettings`) plus mission-tracking state (`activeTrackingId`, `trackingStatus`, `isSuccessModalOpen`) inline. Extract:

- `useEmergencyMissionTracker()` — owns tracking state + `handleRespond`/`handleDecline`/`handleMark*` callbacks
- `useDonorSettingsForm()` — owns the location/status/last-donation save flow

Separately, `components/donor/emergency-alerts-feed.tsx` (332 lines) renders its single `requests.map()` body as one ~200-line card handling declined/collapsed state, approved/pending branches, and 4 action-button variants inline. Extract `AlertCard` (one request's full card) and `DeclinedAlertRow` (the collapsed variant) as sibling components, keeping `EmergencyAlertsFeed` as a thin list wrapper.

Also extract the eligibility banner ("You are eligible to donate again!" card), currently duplicated byte-for-byte between `donor/page.tsx` and `donor/history/page.tsx`, into a single shared `EligibilityBanner` component used by both.

## Acceptance criteria

- [ ] `useEmergencyMissionTracker()` and `useDonorSettingsForm()` hooks extracted, `donor/page.tsx` reduced to composition
- [ ] `AlertCard` and `DeclinedAlertRow` extracted from `emergency-alerts-feed.tsx`
- [ ] `EligibilityBanner` extracted and shared between `donor/page.tsx` and `donor/history/page.tsx`
- [ ] No behavior change in mission tracking, settings save, or alert card rendering

## Blocked by

None — can start immediately
