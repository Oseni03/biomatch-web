## Parent

Redesign plan (from grilling session Q9).

## What to build

Convert the donor and hospital dashboard widget layouts from their current stacked-card arrangement into a bento grid layout with the new design tokens. Same data, same functionality — new visual presentation.

### Shared changes

- Update `components/dashboard/stat-card.tsx` and `section-card.tsx` with new palette, rounded corners, soft borders, hover animations
- Add skeleton loader variants for both card types (pulse animation using shadcn Skeleton)
- Add framer-motion staggered entrance animation when dashboard loads

### Donor dashboard (`app/donor/page.tsx`)

- Rearrange widgets into a bento grid layout:
  - Left column (narrower): DeferralStatusCard, HmoInsuranceCard, LocationSettingsCard
  - Right column (wider): EmergencyAlertsFeed, BloodSupplyChart, DonationHistoryCard
  - Top: ActiveMissionTracker (full width when active)
  - Eligibility banner stays full-width at the top
- Each widget gets updated card styling: `rounded-xl`, soft border, clean background, proper padding
- Framer-motion for card entrance animations

### Hospital dashboard (`components/hospital/hospital-dashboard.tsx` + sub-components)

- Rearrange the tab-based dashboard into a bento grid:
  - Left: stat cards (total requests, active alerts, donors responding, fulfilled)
  - Right: live funnel summary, recent activity
  - Below: emergency history, donor directory sections
- Restyle all sub-components (`RadiusExpansionCard`, `EmergencyRequestForm`, `BroadcastStreamCard`, `LiveStatusPanel`, `EmergencyHistory`, `DonorDirectory`, `AnalyticsDashboard`, `StaffAccounts`) with the new palette and card styles
- Maintain all existing functionality (5s polling, tab navigation, expand/collapse, CSV export, confirm donation flow)

### Files to update

- `components/dashboard/stat-card.tsx`
- `components/dashboard/section-card.tsx`
- `components/donor/*.tsx` (visual restyle of all 8 components)
- `components/hospital/*.tsx` (visual restyle of all 9 components)
- `app/donor/page.tsx` (bento grid layout)
- `app/hospital/page.tsx` + `components/hospital/hospital-dashboard.tsx` (bento grid layout)

## Acceptance criteria

- [ ] Donor dashboard shows widgets in a bento grid layout (not stacked cards)
- [ ] Hospital dashboard shows bento grid layout with stat cards, funnel, history
- [ ] All widget cards use new palette: `rounded-xl`, soft borders, clean backgrounds
- [ ] Skeleton loaders show during data fetch
- [ ] Framer-motion staggered entrance animations on dashboard load
- [ ] All existing functionality preserved (emergency response flow, 5s polling, confirm donation, etc.)
- [ ] Responsive: bento grid collapses to single column on mobile

## Blocked by

- 16-dashboard-sidebar-topbar
