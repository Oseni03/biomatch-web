## Parent

Codebase optimization & page-decomposition audit (2026-07-19) — see CLAUDE.md. User explicitly asked for minimal page content, splitting busy dashboard sections into standalone pages wherever the content justifies it as its own route.

## What to build

`components/hospital/hospital-dashboard.tsx` (rendered from `app/hospital/page.tsx`) is a client-side `useState` tab switcher hiding five independent, heavy features — each already fetches its own data and shares nothing but the top stat-card row:

- Broadcasts (`EmergencyRequestForm`, `LiveStatusPanel`, `RadiusExpansionCard`)
- Donor directory search
- Analytics dashboard (date range, charts, CSV export)
- Paginated/filterable emergency history
- Staff account management

### Convert to real nested routes

- `app/hospital/page.tsx` → broadcasts (current default)
- `app/hospital/directory/page.tsx`
- `app/hospital/analytics/page.tsx`
- `app/hospital/history/page.tsx`
- `app/hospital/staff/page.tsx`
- `app/hospital/layout.tsx` holds the shared stat-card row + `Link`-based tab nav (replacing the `useState` tab switch), so the active tab is reflected in the URL and each section can get its own `loading.tsx`/`error.tsx` boundary and code-split bundle.

### Decompose while moving

Rather than moving the oversized components wholesale, split them as they land in their new route:

- `analytics-dashboard.tsx` → extract `DateRangePicker`, `RequestVolumeChart`, `CoverageGapsCard`
- `emergency-history.tsx` → extract `HistoryFilterBar`, `RequestFunnelCard`
- `live-status-panel.tsx` → extract `DonorStageList` (replace the inline `window.confirm` with a proper confirm hook/dialog)
- `staff-accounts.tsx` → move fetching to a `use-staff.ts` React Query hook (`getStaffMembers`/`inviteStaffMember`/`updateStaffRole`/`removeStaffMember` with cache invalidation) and split into `StaffList` + `InviteStaffForm`

## Acceptance criteria

- [ ] `/hospital`, `/hospital/directory`, `/hospital/analytics`, `/hospital/history`, `/hospital/staff` exist as real routes with their own URL
- [ ] Shared stat-card row + nav lives in a hospital `layout.tsx`, not duplicated per page
- [ ] No more `useState` tab switching — navigation is `Link`-based and reflects in the URL/back button
- [ ] `analytics-dashboard.tsx`, `emergency-history.tsx`, `live-status-panel.tsx`, `staff-accounts.tsx` decomposed per above as part of the move
- [ ] `staff-accounts.tsx` fetching goes through a React Query hook, not manual `useState`/`useEffect`
- [ ] No feature regression versus the current tab-switcher behavior

## Blocked by

None — can start immediately
