## Parent

Redesign plan (from grilling session Q5, Q6).

## What to build

Visually redesign the dashboard sidebar and top navigation bar across all roles (donor, hospital, admin). No changes to nav item structure or routing — only visual refresh and top bar component additions.

### Sidebar visual redesign

- Apply the new `#C1121F` palette to sidebar tokens in `globals.css` (`--sidebar-primary`, `--sidebar-accent`, etc.)
- Update `components/layout/sidebar.tsx`:
  - Rounded nav items (`rounded-xl`), soft hover backgrounds, brand-colored active state
  - Generous spacing (consistent padding)
  - Clean icon style (same lucide icons, brand color on active)
  - Redesign the BioMatch logo/header area at the top with new font and color
  - Keep role-specific nav items (donor: Dashboard/Health Profile/Wallet; hospital: Live Inventory/Emergency Request/Donor Finder/Blood Drive; admin: System Overview/Verification/Contracts)
- Update `components/nav-main.tsx` visual styling to match
- Add skeleton loader for sidebar on initial load

### Top bar redesign

- Move `NavUser` (user avatar dropdown with sign out) from the sidebar footer to the top-right of the top bar
- Add Notifications bell icon with unread badge count (use `AlertCountProvider` context for the count)
- Add Emergency Alert Button — a red SOS/pulse button that opens a quick-action dropdown or links to the emergency request page (for hospital role) or shows active alerts (for donor role)
- Keep sidebar trigger (hamburger), section label, and theme toggle in the top bar
- Restyle the top bar with the new palette: clean background, soft bottom border, proper spacing

### Files to update

- `components/layout/sidebar.tsx`
- `components/nav-main.tsx`
- `components/nav-user.tsx`
- `components/ui/sidebar.tsx` (if sidebar primitive visual overrides are needed)
- Add new top bar components as needed

## Acceptance criteria

- [ ] Sidebar nav items use `rounded-xl`, brand-colored active state, soft hover
- [ ] Sidebar BioMatch logo/header uses Geist font and new palette
- [ ] User avatar appears in top-right of top bar instead of sidebar footer
- [ ] Notifications bell shows in top bar with unread badge count
- [ ] Emergency Alert Button (red SOS) appears in top bar
- [ ] Skeleton loader shows while sidebar is loading
- [ ] All role-specific nav items preserved and functional
- [ ] Responsive: sidebar collapses on mobile

## Blocked by

- 12-design-foundation
