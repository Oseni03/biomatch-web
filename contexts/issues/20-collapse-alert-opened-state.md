## Parent

Simplification pass (grilling session, 2026-07-16) — see AGENTS.md / CLAUDE.md.

## What to build

Hospital staff see a 6-stage alert funnel (`alerted → accepted/declined → en_route → arrived → completed`) instead of 7. The former `opened` stage (donor viewed the alert but hasn't responded) is no longer a distinct `AlertStatus` value — it becomes an `openedAt` timestamp on `EmergencyAlert` (alongside the existing `respondedAt`), so the read-receipt data isn't lost, it's just not a funnel stage anyone can act on.

`en_route` and `arrived` are kept as distinct stages — they map to real hospital staff actions ("prep the draw station" vs "still waiting") and are not being collapsed.

### Schema

- Remove `opened` from `AlertStatus` enum (migration required)
- Add `openedAt DateTime?` to `EmergencyAlert`

### Server logic

- `respondToAlert()` / `updateAlertStatus()` in `servers/emergency.ts` — a donor viewing an alert sets `openedAt` instead of transitioning `status` to `opened`
- `computeAlertAggregates()` — funnel counts drop the `opened` bucket

### UI

- `components/hospital/live-status-panel.tsx` — funnel keys drop `opened`
- `components/hospital/emergency-history.tsx` — status filter dropdown drops `opened`

## Acceptance criteria

- [ ] `AlertStatus` enum has 6 values, no `opened`
- [ ] `EmergencyAlert.openedAt` timestamp exists and is set when a donor views an alert
- [ ] Live status panel funnel shows 6 stages, not 7
- [ ] Emergency history status filter shows 6 stages, not 7
- [ ] No code references the `opened` status string
- [ ] `en_route` and `arrived` remain distinct, unaffected stages

## Blocked by

None — can start immediately
